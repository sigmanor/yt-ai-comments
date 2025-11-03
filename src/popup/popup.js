// Function to apply dark theme
function applyTheme() {
  console.log('Applying dark theme to popup');

  // Apply dark theme to both html and body elements
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.setAttribute('data-theme', 'dark');
  console.log('Dark theme applied to popup, data-theme attribute set on HTML and BODY');

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

// Apply dark theme before DOM is fully loaded
document.documentElement.setAttribute('data-theme', 'dark');

// Get default language based on browser settings
function getDefaultLanguage() {
  const supported = ['uk', 'en', 'pl', 'de', 'fr'];
  const browserLang = navigator.language.substring(0, 2).toLowerCase();
  return supported.includes(browserLang) ? browserLang : 'en';
}

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

document.addEventListener('DOMContentLoaded', function() {
  // Update title with version
  const manifest = chrome.runtime.getManifest();
  const version = manifest.version;
  const titleElement = document.querySelector('h1');
  if (titleElement) {
    titleElement.innerHTML = `YouTube AI Comments Generator <a href="https://github.com/Sigmanor/yt-ai-comments/blob/main/CHANGELOG.md" target="_blank">v${version}</a>`;
  }

  // Default values
  const defaultOptions = {
    language: getDefaultLanguage(),
    provider: 'openai',
    apiKey: '',
    model: '',  // Will be set dynamically based on provider
    theme: 'dark'  // Only dark theme is used
  };

  // Load saved options
  chrome.storage.sync.get(defaultOptions, function (options) {
    console.log('Loaded options:', options);

    // Set language dropdown
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
      languageSelect.value = options.language || defaultOptions.language;
    }

    // Set provider dropdown
    const providerSelect = document.getElementById('provider');
    if (providerSelect) {
      providerSelect.value = options.provider || defaultOptions.provider;
    }

    // Set API key
    const apiKeyInput = document.getElementById('api-key');
    if (apiKeyInput) {
      apiKeyInput.value = options.apiKey || '';
    }

    // Set model with default if empty
    const modelInput = document.getElementById('model');
    if (modelInput) {
      const modelValue = options.model || getDefaultModel(options.provider || defaultOptions.provider);
      modelInput.value = modelValue;
    }

    // Apply dark theme
    applyTheme();
  });

  // Add event listener for language change
  const languageSelect = document.getElementById('language');
  if (languageSelect) {
    languageSelect.addEventListener('change', function () {
      const selectedLanguage = this.value;
      console.log('Language changed to:', selectedLanguage);

      // Save the language change
      chrome.storage.sync.set({ language: selectedLanguage }, () => {
        console.log('Language saved after change');
      });
    });
  }

  // Add event listener for provider change
  const providerSelect = document.getElementById('provider');
  if (providerSelect) {
    providerSelect.addEventListener('change', function () {
      const selectedProvider = this.value;
      console.log('Provider changed to:', selectedProvider);

      // Update model field if it's using a default value
      const modelInput = document.getElementById('model');
      if (modelInput && (!modelInput.value || modelInput.value === 'gpt-4o-mini' || modelInput.value === 'mistral-small-latest')) {
        modelInput.value = getDefaultModel(selectedProvider);
        console.log('Changed model to:', modelInput.value, 'for provider:', selectedProvider);
      }

      // Save the provider change
      chrome.storage.sync.set({ provider: selectedProvider }, () => {
        console.log('Provider saved after change');
      });
    });
  }

  // Add event listener for API key change
  const apiKeyInput = document.getElementById('api-key');
  if (apiKeyInput) {
    // Listen for both change and input events
    ['change', 'input'].forEach(eventType => {
      apiKeyInput.addEventListener(eventType, function () {
        const apiKey = this.value;
        console.log('API key changed (length):', apiKey.length);

        // Save the API key change
        chrome.storage.sync.set({ apiKey: apiKey }, () => {
          console.log('API key saved after change');
        });
      });
    });
  }

  // Add event listener for model change
  const modelInput = document.getElementById('model');
  if (modelInput) {
    // Listen for both change and input events
    ['change', 'input'].forEach(eventType => {
      modelInput.addEventListener(eventType, function () {
        const model = this.value;
        console.log('Model changed to:', model);

        // Save the model change
        chrome.storage.sync.set({ model: model }, () => {
          console.log('Model saved after change');
        });
      });
    });
  }

  // Theme is now controlled only from the options page

  // Open settings page when button is clicked and close the popup
  document.getElementById('options-btn').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
    window.close(); // Close the popup after opening options page
  });

  // Open about page when button is clicked and close the popup
  document.getElementById('about-btn').addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('about/about.html') });
    window.close(); // Close the popup after opening about page
  });

  // Open PayPal donation page when button is clicked and close the popup
  document.getElementById('donate-btn').addEventListener('click', function () {
    chrome.tabs.create({ url: 'https://www.paypal.com/donate/?hosted_button_id=JD8VFJT82ZY66' });
    window.close(); // Close the popup after opening PayPal page
  });
});
