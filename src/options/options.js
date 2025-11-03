// Get default language based on browser settings
function getDefaultLanguage() {
  const supported = ['uk', 'en', 'pl', 'de', 'fr'];
  const browserLang = navigator.language.substring(0, 2).toLowerCase();
  return supported.includes(browserLang) ? browserLang : 'en';
}

// Default values
const defaultOptions = {
  language: getDefaultLanguage(),
  provider: 'openai',
  apiKey: '',
  model: '',  // Will be set dynamically based on provider
  maxTokens: 2000,
  temperature: 0.5,
  theme: 'dark', // Only dark theme is used
  prompt: '**Write a sincere and natural-sounding positive comment for a YouTube video. Use at least 10 words. Vary the structure and avoid overused phrases. Try to refer to something that could realistically appear in the video based on its title.**\n\n**Always end the comment with two new lines followed by this text (in English): (Created by YouTube AI Comments Generator)**'
};

// Get default model based on provider
function getDefaultModel(provider) {
  if (provider === 'openai') {
    return 'gpt-4o-mini';
  } else if (provider === 'mistralai') {
    return 'mistral-small-latest';
  } else if (provider === 'openrouter') {
    return 'openai/gpt-4.1-nano';
  }
  return 'gpt-4o-mini'; // Default to OpenAI if provider is unknown
}

// Simple function to save settings to chrome.storage.sync
function saveToStorage(data) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Attempting to save data to storage:', data);
      chrome.storage.sync.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving to storage:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log('Successfully saved to storage:', data);

          // Verify the data was saved correctly by reading it back
          chrome.storage.sync.get(null, (result) => {
            console.log('Verification - data in storage after save:', result);
            resolve();
          });
        }
      });
    } catch (error) {
      console.error('Exception when saving to storage:', error);
      reject(error);
    }
  });
}

// Simple function to load settings from chrome.storage.sync
function loadFromStorage(keys) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Attempting to load data from storage with keys:', keys);

      // First, get all data to see what's actually in storage
      chrome.storage.sync.get(null, (allData) => {
        console.log('All data currently in storage:', allData);

        // Then get the specific keys we need
        chrome.storage.sync.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            console.error('Error loading from storage:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('Successfully loaded from storage:', result);

            // Check if provider is present in the result
            if (result.provider) {
              console.log('Provider found in storage:', result.provider);
            } else {
              console.warn('Provider not found in storage, using default:', keys.provider);
              result.provider = keys.provider;
            }

            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error('Exception when loading from storage:', error);
      reject(error);
    }
  });
}

// Function to get color based on temperature (0 = cold/blue, 2 = hot/red)
function getTemperatureColor(temperature) {
  // Convert temperature to a value between 0 and 1
  const temp = parseFloat(temperature) / 2;
  if (isNaN(temp)) return '#f2c53c'; // Default yellow if invalid

  // Create a gradient from blue (cold) to red (hot)
  if (temp <= 0.2) {
    // Cold blue (0-0.2)
    return '#3498db';
  } else if (temp <= 0.4) {
    // Cool blue-green (0.2-0.4)
    return '#2ecc71';
  } else if (temp <= 0.6) {
    // Neutral yellow (0.4-0.6)
    return '#f2c53c';
  } else if (temp <= 0.8) {
    // Warm orange (0.6-0.8)
    return '#e67e22';
  } else {
    // Hot red (0.8-1.0)
    return '#e74c3c';
  }
}

// Function to update temperature display
function updateTemperatureDisplay(value) {
  const temperatureValue = document.getElementById('temperature-value');
  if (temperatureValue) {
    temperatureValue.textContent = value;
    temperatureValue.style.color = getTemperatureColor(value);
    console.log('Temperature updated to:', value, 'with color:', getTemperatureColor(value));
  }
}

// Function to apply dark theme
function applyTheme() {
  console.log('Applying dark theme');

  // Apply dark theme to both html and body elements
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.setAttribute('data-theme', 'dark');
  console.log('Dark theme applied, data-theme attribute set on HTML and BODY');

  // Force a repaint to ensure styles are applied
  const originalDisplay = document.body.style.display;
  document.body.style.display = 'none';
  // Trigger a reflow
  void document.body.offsetHeight;
  document.body.style.display = originalDisplay;

  // Log the current theme state
  console.log('Current HTML data-theme:', document.documentElement.getAttribute('data-theme'));
  console.log('Current BODY data-theme:', document.body.getAttribute('data-theme'));
}

// Load saved settings
async function loadOptions() {
  console.log('Loading options...');

  try {
    // Load options from storage
    const options = await loadFromStorage(defaultOptions);
    console.log('Loaded options:', options);

    // Set language
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
      const langValue = options.language || defaultOptions.language;
      console.log('Setting language to:', langValue);
      languageSelect.value = langValue;
    }

    // Set provider - this is the field that's not being saved/loaded correctly
    const providerSelect = document.getElementById('provider');
    if (providerSelect) {
      const providerValue = options.provider || defaultOptions.provider;
      console.log('Setting provider to:', providerValue, 'Options provider:', options.provider);

      // Force the value to be set
      providerSelect.value = providerValue;

      // Double-check that the value was set correctly
      setTimeout(() => {
        console.log('Provider value after setting:', providerSelect.value);
        if (providerSelect.value !== providerValue) {
          console.warn('Provider value was not set correctly, trying again...');
          providerSelect.value = providerValue;
        }
      }, 100);
    }

    // Set API key
    const apiKeyInput = document.getElementById('api-key');
    if (apiKeyInput) {
      const apiKeyValue = options.apiKey || '';
      console.log('Setting API key (length):', apiKeyValue.length);
      apiKeyInput.value = apiKeyValue;
    }

    // Set model with default if empty
    if (document.getElementById('model')) {
      const modelValue = options.model || getDefaultModel(options.provider || defaultOptions.provider);
      document.getElementById('model').value = modelValue;
    }

    // Set max tokens
    if (document.getElementById('max-tokens')) {
      document.getElementById('max-tokens').value = options.maxTokens || defaultOptions.maxTokens;
    }

    // Set prompt value
    if (document.getElementById('prompt')) {
      document.getElementById('prompt').value = options.prompt || defaultOptions.prompt;
    }

    // Handle temperature slider
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');

    if (temperatureSlider && temperatureValue) {
      // Set initial value
      const tempValue = options.temperature !== undefined ? options.temperature : defaultOptions.temperature;
      temperatureSlider.value = tempValue;

      // Update temperature display with color
      updateTemperatureDisplay(tempValue);

      console.log('Set temperature to:', tempValue);
    }

    // Apply dark theme
    applyTheme();

  } catch (error) {
    console.error('Failed to load options:', error);
    alert('Failed to load settings. Using defaults.');
  }

    // Add event listener for provider change
    const providerSelect = document.getElementById('provider');
    if (providerSelect) {
      // Remove existing event listeners by cloning
      const newProviderSelect = providerSelect.cloneNode(true);
      if (providerSelect.parentNode) {
        providerSelect.parentNode.replaceChild(newProviderSelect, providerSelect);
      }

      // Add new event listener
      newProviderSelect.addEventListener('change', function() {
        const provider = this.value;
        const modelInput = document.getElementById('model');
        if (modelInput && (!modelInput.value || modelInput.value === 'gpt-4o-mini' || modelInput.value === 'mistral-small-latest')) {
          modelInput.value = getDefaultModel(provider);
          console.log('Changed model to:', modelInput.value, 'for provider:', provider);
        }
      });
    }
  }

// Save settings
async function saveOptions() {
  try {
    // Get max tokens value and ensure it's a number
    const maxTokensInput = document.getElementById('max-tokens');
    let maxTokens = parseInt(maxTokensInput.value, 10);
    if (isNaN(maxTokens) || maxTokens < 1) {
      maxTokens = defaultOptions.maxTokens;
      maxTokensInput.value = maxTokens;
    }

    // Get temperature value and ensure it's a number
    const temperatureInput = document.getElementById('temperature');
    let temperature = parseFloat(temperatureInput.value);
    if (isNaN(temperature) || temperature < 0 || temperature > 1) {
      temperature = defaultOptions.temperature;
      temperatureInput.value = temperature;
      // Update temperature display with color
      updateTemperatureDisplay(temperature);
    }

    // Get model value, use default if empty
    const modelInput = document.getElementById('model');
    let model = modelInput.value.trim();
    if (!model) {
      model = getDefaultModel(document.getElementById('provider').value);
      modelInput.value = model;
    }

    // Get provider value - this is the field that's not being saved/loaded correctly
    const providerSelect = document.getElementById('provider');
    const providerValue = providerSelect ? providerSelect.value : defaultOptions.provider;
    console.log('Getting provider value for saving:', providerValue);

    // Theme is always dark
    console.log('Using dark theme');

    const options = {
      language: document.getElementById('language').value,
      provider: providerValue,
      apiKey: document.getElementById('api-key').value,
      model: model,
      maxTokens: maxTokens,
      temperature: temperature,
      theme: 'dark', // Always dark theme
      prompt: document.getElementById('prompt').value
    };

    // Log the options being saved
    console.log('Options being saved:', options);

    console.log('Saving options:', options);

    // Save options to storage
    await saveToStorage(options);

    // Show success message
    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Settings saved!';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    }

    console.log('Options saved successfully');

    // Test that options were saved correctly
    const savedOptions = await loadFromStorage(options);
    console.log('Verification - options after save:', savedOptions);

    return true;
  } catch (error) {
    console.error('Failed to save options:', error);
    alert('Failed to save settings: ' + error.message);
    return false;
  }
}

// Reset settings to default values
async function resetOptions() {
  try {
    console.log('Resetting to defaults:', defaultOptions);

    // Reset language
    if (document.getElementById('language')) {
      document.getElementById('language').value = defaultOptions.language;
    }

    // Reset provider
    if (document.getElementById('provider')) {
      document.getElementById('provider').value = defaultOptions.provider;
    }

    // Reset API key
    if (document.getElementById('api-key')) {
      document.getElementById('api-key').value = '';
    }

    // Reset model
    if (document.getElementById('model')) {
      document.getElementById('model').value = getDefaultModel(defaultOptions.provider);
    }

    // Reset max tokens
    if (document.getElementById('max-tokens')) {
      document.getElementById('max-tokens').value = defaultOptions.maxTokens;
    }

    // Reset temperature
    const temperatureSlider = document.getElementById('temperature');

    if (temperatureSlider) {
      temperatureSlider.value = defaultOptions.temperature;
      // Update temperature display with color
      updateTemperatureDisplay(defaultOptions.temperature);
    }

    // Reset prompt
    if (document.getElementById('prompt')) {
      document.getElementById('prompt').value = defaultOptions.prompt;
    }

    // Apply dark theme
    applyTheme();

    // Save the default options
    await saveOptions();

    // Show status message
    const status = document.getElementById('status');
    if (status) {
      status.textContent = 'Settings reset to defaults!';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    }

    return true;
  } catch (error) {
    console.error('Failed to reset options:', error);
    alert('Failed to reset settings: ' + error.message);
    return false;
  }
}

// Initialize the page
// Apply dark theme before DOM is fully loaded
document.documentElement.setAttribute('data-theme', 'dark');

document.addEventListener('DOMContentLoaded', async function() {
  try {
    console.log('DOM loaded, initializing options page...');

    // Check what's in storage before loading options
    chrome.storage.sync.get(null, (result) => {
      console.log('Initial storage state:', result);
    });

    // Load saved options
    await loadOptions();

    // Double-check provider value after loading
    const providerSelectElem = document.getElementById('provider');
    if (providerSelectElem) {
      console.log('Provider value after loading options:', providerSelectElem.value);

      // Get the actual value from storage directly
      chrome.storage.sync.get(['provider'], (result) => {
        console.log('Provider value directly from storage:', result.provider);
        if (result.provider && providerSelectElem.value !== result.provider) {
          console.warn('Provider mismatch! Setting to value from storage:', result.provider);
          providerSelectElem.value = result.provider;
        }
      });
    }

    // Add input validation for max-tokens field
    const maxTokensInput = document.getElementById('max-tokens');
    if (maxTokensInput) {
      // Prevent non-numeric input
      maxTokensInput.addEventListener('keypress', function (e) {
        // Allow only numbers (0-9) and control keys
        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
          e.preventDefault();
        }
      });

      // Clean up any non-numeric values on blur
      maxTokensInput.addEventListener('blur', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value === '') {
          this.value = defaultOptions.maxTokens;
        }
      });
    }

    // Add event listeners to buttons
    const saveButton = document.getElementById('save-btn');
    if (saveButton) {
      saveButton.addEventListener('click', async function() {
        console.log('Save button clicked');
        await saveOptions();

        // Verify provider was saved correctly
        const providerElem = document.getElementById('provider');
        if (providerElem) {
          const selectedProvider = providerElem.value;
          console.log('Provider value at save time:', selectedProvider);

          // Check storage directly after save
          setTimeout(() => {
            chrome.storage.sync.get(['provider'], (result) => {
              console.log('Provider in storage after save:', result.provider);
              if (result.provider !== selectedProvider) {
                console.error('Provider was not saved correctly!');
              }
            });
          }, 500);
        }
      });
    }

    const resetButton = document.getElementById('reset-btn');
    if (resetButton) {
      resetButton.addEventListener('click', async function() {
        console.log('Reset button clicked');
        await resetOptions();
      });
    }

    // Add event listener to temperature slider
    const temperatureSlider = document.getElementById('temperature');
    if (temperatureSlider) {
      temperatureSlider.addEventListener('input', function() {
        // Update temperature display with color
        updateTemperatureDisplay(this.value);
        console.log('Temperature slider changed to:', this.value);
      });
    }

    // Add event listener for provider change
    const providerChangeElem = document.getElementById('provider');
    if (providerChangeElem) {
      providerChangeElem.addEventListener('change', function() {
        const provider = this.value;
        const modelInput = document.getElementById('model');
        if (modelInput && (!modelInput.value || modelInput.value === 'gpt-4o-mini' || modelInput.value === 'mistral-small-latest')) {
          modelInput.value = getDefaultModel(provider);
          console.log('Changed model to:', modelInput.value, 'for provider:', provider);
        }

        // Save the provider change immediately
        console.log('Provider changed to:', provider, '- saving immediately');
        chrome.storage.sync.set({ provider: provider }, () => {
          console.log('Provider saved after change');

          // Verify it was saved
          chrome.storage.sync.get(['provider'], (result) => {
            console.log('Provider in storage after change:', result.provider);
          });
        });
      });
    }

    // Theme is always dark, no event listener needed

    console.log('Options page initialized successfully');

    // Add event listener for the About button
    const aboutButton = document.getElementById('about-button');
    if (aboutButton) {
      aboutButton.addEventListener('click', function () {
        console.log('About button clicked');
        // Open about.html in a new window
        window.open(chrome.runtime.getURL('about/about.html'), '_blank', 'width=600,height=780');
      });
    }
  } catch (error) {
    console.error('Error initializing options page:', error);
    alert('Error initializing options page: ' + error.message);
  }
});
