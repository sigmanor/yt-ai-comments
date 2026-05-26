// Global variable to track if the button has been added
let buttonAdded = false;
let observer = null;
let checkInterval = null;
let commentVariantsEscHandler = null;

const variantCountConfig = {
  min: 1,
  max: 6,
  default: 1
};

function normalizeVariantCount(value) {
  const variantCount = parseInt(value, 10);

  if (
    isNaN(variantCount) ||
    variantCount < variantCountConfig.min ||
    variantCount > variantCountConfig.max
  ) {
    return variantCountConfig.default;
  }

  return variantCount;
}

// Function to add the comment generation button
function addGenerateButton() {
  // Check if we are on a YouTube page
  if (!window.location.hostname.includes('youtube.com')) {
    return;
  }

  // Clear previous intervals and observers
  clearPreviousListeners();

  // Function to find the YouTube comment buttons container
  function findCommentButtonsContainer() {
    // Try to find the YouTube comment buttons container using the provided selector
    const buttonsContainer = document.querySelector('#thumbnail-input-row > div:nth-child(2) > div:nth-child(7) > div:nth-child(7)');

    if (buttonsContainer) {
      return buttonsContainer;
    }

    // Try to find the container with the "Коментувати" button
    const commentButton = Array.from(document.querySelectorAll('button')).find(btn =>
      btn.textContent.includes('Коментувати') || btn.textContent.includes('Comment')
    );

    if (commentButton) {
      const container = commentButton.closest('div[class*="style-scope"]');
      if (container) {
        return container.parentElement || container;
      }
    }

    // Try alternative selectors if the specific one doesn't work
    const alternativeContainer = document.querySelector('#thumbnail-input-row ytd-button-renderer');
    if (alternativeContainer && alternativeContainer.parentElement) {
      return alternativeContainer.parentElement;
    }

    // Try to find any button container in the comment area
    const commentArea = document.querySelector('ytd-comments ytd-comment-simplebox-renderer');
    if (commentArea) {
      const buttons = commentArea.querySelectorAll('ytd-button-renderer');
      if (buttons.length > 0 && buttons[0].parentElement) {
        return buttons[0].parentElement;
      }
    }
    return null;
  }

  // Function to add a button to the comment buttons container
  function addGenerateButton() {
    // If the button is already added to the page, remove all existing buttons
    const existingButtons = document.querySelectorAll('.ai-comment-generator-btn, .ai-comment-dropdown-container');
    existingButtons.forEach(btn => btn.remove());

    // Find the comment buttons container
    const buttonsContainer = findCommentButtonsContainer();
    if (!buttonsContainer) {
      return false;
    }

    // Create dropdown container to hold the button and menu
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'ai-comment-dropdown-container';
    dropdownContainer.style.position = 'relative';
    dropdownContainer.style.display = 'inline-block';
    dropdownContainer.style.marginRight = '8px';

    // Create main button with magic wand icon
    const button = document.createElement('button');
    button.className = 'ai-comment-generator-btn';
    const magicWandBase64 = 'data:image/png;base64,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';
    button.innerHTML = '<img src="' + magicWandBase64 + '" alt="Generate" class="ai-comment-icon" />';
    button.title = 'Generate a comment using AI';

    // Try to match YouTube's button style
    try {
      // Find YouTube's buttons to copy their style
      const youtubeButtons = document.querySelectorAll('button');
      let targetButton = null;

      // Prefer the "Comment"/"Коментувати" button
      for (const btn of youtubeButtons) {
        if (btn.textContent.includes('Коментувати') || btn.textContent.includes('Comment')) {
          targetButton = btn;
          break;
        }
      }
      // Fallback to "Cancel"/"Скасувати" button
      if (!targetButton) {
        for (const btn of youtubeButtons) {
          if (btn.textContent.includes('Скасувати') || btn.textContent.includes('Cancel')) {
            targetButton = btn;
            break;
          }
        }
      }

      if (targetButton) {
        const computedStyle = window.getComputedStyle(targetButton);
        button.style.height = computedStyle.height;
        button.style.borderRadius = computedStyle.borderRadius;
        button.style.fontFamily = computedStyle.fontFamily;
        button.style.fontSize = computedStyle.fontSize;
        button.style.fontWeight = computedStyle.fontWeight;
        button.style.lineHeight = computedStyle.lineHeight;
        button.style.padding = computedStyle.padding;
        button.style.marginRight = '8px';
        // Force our specific red style regardless of copied styles
        button.style.backgroundColor = 'rgb(204, 59, 59)';
        button.style.color = '#ffffff';
        button.style.border = computedStyle.border;
        button.style.cursor = 'pointer';
      } else {
        // Minimal fallback styles
        button.style.height = '36px';
        button.style.padding = '0 16px';
        button.style.marginRight = '8px';
        button.style.borderRadius = '18px';
        button.style.fontSize = '14px';
        button.style.fontWeight = '500';
        button.style.cursor = 'pointer';
        button.style.border = 'none';
        // Ensure our specific red style in fallback too
        button.style.backgroundColor = 'rgb(204, 59, 59)';
        button.style.color = '#ffffff';
      }
    } catch (error) {
      console.error('Error copying YouTube button style:', error);
    }

    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.style.display = 'none';
    dropdownMenu.style.position = 'absolute';
    dropdownMenu.style.top = '100%';
    dropdownMenu.style.left = '0';
    dropdownMenu.style.borderRadius = '4px';
    dropdownMenu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    dropdownMenu.style.zIndex = '10000';
    dropdownMenu.style.minWidth = '200px';
    dropdownMenu.style.padding = '8px 0';

    // Theme detection
    const isDarkTheme = detectYouTubeDarkTheme();

    if (isDarkTheme) {
      dropdownMenu.style.backgroundColor = '#282828';
      dropdownMenu.style.border = '1px solid #404040';
      dropdownMenu.style.color = '#fff';
    } else {
      dropdownMenu.style.backgroundColor = '#fff';
      dropdownMenu.style.border = '1px solid #ccc';
      dropdownMenu.style.color = '#333';
    }

    // Mood section
    const moodSection = document.createElement('div');
    moodSection.style.padding = '8px 12px';
    moodSection.style.borderBottom = isDarkTheme ? '1px solid #404040' : '1px solid #eee';

    const moodLabel = document.createElement('div');
    moodLabel.textContent = 'Mood:';
    moodLabel.style.fontSize = '12px';
    moodLabel.style.fontWeight = 'bold';
    moodLabel.style.marginBottom = '4px';
    moodLabel.style.color = isDarkTheme ? '#ccc' : '#666';

    const moodSelect = document.createElement('select');
    moodSelect.id = 'ai-comment-mood';
    moodSelect.style.width = '100%';
    moodSelect.style.padding = '4px';
    moodSelect.style.border = isDarkTheme ? '1px solid #404040' : '1px solid #ccc';
    moodSelect.style.borderRadius = '3px';
    moodSelect.style.fontSize = '12px';
    moodSelect.style.backgroundColor = isDarkTheme ? '#1f1f1f' : '#fff';
    moodSelect.style.color = isDarkTheme ? '#fff' : '#333';

    const moods = [
      { value: 'neutral', text: 'Neutral' },
      { value: 'positive', text: 'Positive' },
      { value: 'enthusiastic', text: 'Enthusiastic' },
      { value: 'funny', text: 'Funny' },
      { value: 'ironic', text: 'Ironic' },
      { value: 'critical', text: 'Critical' },
      { value: 'supportive', text: 'Supportive' }
    ];

    // First create options with default selection
    moods.forEach(mood => {
      const option = document.createElement('option');
      option.value = mood.value;
      option.textContent = mood.text;
      if (mood.value === 'neutral') option.selected = true;
      moodSelect.appendChild(option);
    });

    // Then get the saved mood from storage and update selection if available
    chrome.storage.sync.get({ savedMood: 'neutral' }, function (data) {
      const savedMood = data.savedMood;
      if (savedMood && savedMood !== 'neutral') {
        // Find and select the saved option
        for (let i = 0; i < moodSelect.options.length; i++) {
          if (moodSelect.options[i].value === savedMood) {
            moodSelect.selectedIndex = i;
            break;
          }
        }
      }
    });

    moodSection.appendChild(moodLabel);
    moodSection.appendChild(moodSelect);
    moodSection.addEventListener('click', (e) => e.stopPropagation());

    // Save mood selection when it changes
    moodSelect.addEventListener('change', (e) => {
      const selectedMood = e.target.value;
      chrome.storage.sync.set({ savedMood: selectedMood }, function () { });
    });

    // Language section
    const langSection = document.createElement('div');
    langSection.style.padding = '8px 12px';

    const langLabel = document.createElement('div');
    langLabel.textContent = 'Language:';
    langLabel.style.fontSize = '12px';
    langLabel.style.fontWeight = 'bold';
    langLabel.style.marginBottom = '4px';
    langLabel.style.color = isDarkTheme ? '#ccc' : '#666';

    const langSelect = document.createElement('select');
    langSelect.id = 'ai-comment-language';
    langSelect.style.width = '100%';
    langSelect.style.padding = '4px';
    langSelect.style.border = isDarkTheme ? '1px solid #404040' : '1px solid #ccc';
    langSelect.style.borderRadius = '3px';
    langSelect.style.fontSize = '12px';
    langSelect.style.backgroundColor = isDarkTheme ? '#1f1f1f' : '#fff';
    langSelect.style.color = isDarkTheme ? '#fff' : '#333';

    const languages = [
      { value: 'default', text: 'Use Settings Language' },
      { value: 'uk', text: 'Ukrainian' },
      { value: 'en', text: 'English' },
      { value: 'pl', text: 'Polish' },
      { value: 'de', text: 'German' },
      { value: 'fr', text: 'French' }
    ];

    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.value;
      option.textContent = lang.text;
      if (lang.value === 'default') option.selected = true;
      langSelect.appendChild(option);
    });

    langSection.appendChild(langLabel);
    langSection.appendChild(langSelect);
    langSection.addEventListener('click', (e) => e.stopPropagation());

    // Generate action button inside dropdown
    const generateBtn = document.createElement('button');
    generateBtn.textContent = 'Generate Comment';
    generateBtn.style.width = 'calc(100% - 16px)';
    generateBtn.style.margin = '8px';
    generateBtn.style.padding = '8px';
    generateBtn.style.backgroundColor = '#1976d2';
    generateBtn.style.color = 'white';
    generateBtn.style.border = 'none';
    generateBtn.style.borderRadius = '3px';
    generateBtn.style.cursor = 'pointer';
    generateBtn.style.fontSize = '12px';
    generateBtn.style.transition = 'background-color 0.2s';

    const generationMessage = document.createElement('div');
    generationMessage.className = 'ai-comment-generation-message';
    generationMessage.setAttribute('role', 'status');
    generationMessage.setAttribute('aria-live', 'polite');
    generationMessage.style.display = 'none';
    generationMessage.style.margin = '8px 8px 0';
    generationMessage.style.padding = '8px';
    generationMessage.style.borderRadius = '3px';
    generationMessage.style.fontSize = '12px';
    generationMessage.style.lineHeight = '1.35';
    generationMessage.style.backgroundColor = isDarkTheme ? '#3e2222' : '#fff0f0';
    generationMessage.style.border = isDarkTheme ? '1px solid #8a3737' : '1px solid #f0b5b5';
    generationMessage.style.color = isDarkTheme ? '#ffb3b3' : '#8a1f1f';

    generateBtn.addEventListener('mouseenter', () => {
      generateBtn.style.backgroundColor = '#1565c0';
    });
    generateBtn.addEventListener('mouseleave', () => {
      generateBtn.style.backgroundColor = '#1976d2';
    });
    generateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mood = moodSelect.value;
      const language = langSelect.value;

      // Save the current mood selection
      chrome.storage.sync.set({ savedMood: mood }, function () { });

      generateComment(mood, language, dropdownMenu);
    });

    // Assemble dropdown menu
    dropdownMenu.appendChild(moodSection);
    dropdownMenu.appendChild(langSection);
    dropdownMenu.appendChild(generationMessage);
    dropdownMenu.appendChild(generateBtn);

    // Toggle dropdown on main button click
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdownMenu.style.display === 'block';
      dropdownMenu.style.display = isVisible ? 'none' : 'block';
    });

    // Hover effect for main button (match requested RGB)
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = 'rgb(184, 73, 73)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'rgb(204, 59, 59)';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdownMenu.style.display = 'none';
    });

    // Prevent dropdown from closing when interacting inside
    dropdownMenu.addEventListener('click', (e) => e.stopPropagation());

    // Mount elements
    dropdownContainer.appendChild(button);
    dropdownContainer.appendChild(dropdownMenu);

    // Try to find the best place to insert our button
    // First, look for the "Cancel" or "Скасувати" button
    const cancelButton = Array.from(buttonsContainer.querySelectorAll('button')).find(btn =>
      btn.textContent.includes('Скасувати') || btn.textContent.includes('Cancel')
    );

    if (cancelButton && cancelButton.parentElement) {
      // Insert our dropdown container after the cancel button
      if (cancelButton.nextSibling) {
        cancelButton.parentElement.insertBefore(dropdownContainer, cancelButton.nextSibling);
      } else {
        cancelButton.parentElement.appendChild(dropdownContainer);
      }
      buttonAdded = true;
      return true;
    }

    // If we can't find the cancel button, try to insert before the first button
    const firstButton = buttonsContainer.querySelector('ytd-button-renderer, button');
    if (firstButton) {
      // Check if this is the comment button
      const isCommentButton = firstButton.textContent &&
        (firstButton.textContent.includes('Коментувати') || firstButton.textContent.includes('Comment'));

      if (isCommentButton) {
        // Insert before the comment button
        buttonsContainer.insertBefore(dropdownContainer, firstButton);
      } else {
        // Insert after the first button
        if (firstButton.nextSibling) {
          buttonsContainer.insertBefore(dropdownContainer, firstButton.nextSibling);
        } else {
          buttonsContainer.appendChild(dropdownContainer);
        }
      }

      buttonAdded = true;
      return true;
    } else {
      // If no button found, just append dropdown container to the container
      buttonsContainer.appendChild(dropdownContainer);
      buttonAdded = true;
      return true;
    }
  }

  // Function to get the video title
  function getVideoTitle() {
    const titleElement = document.querySelector('yt-formatted-string.ytd-watch-metadata:nth-child(1)');
    if (titleElement) {
      return titleElement.textContent.trim();
    }

    // Try alternative selectors if the specific one doesn't work
    const altTitleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
    if (altTitleElement) {
      return altTitleElement.textContent.trim();
    }

    // Try more general selector
    const anyTitleElement = document.querySelector('h1 yt-formatted-string');
    if (anyTitleElement) {
      return anyTitleElement.textContent.trim();
    }

    return 'Unknown Video Title';
  }

  // Collects extra grounding context (description, tags, category) for the LLM.
  // Missing fields come back as empty strings so the prompt builder can skip them.
  function getVideoContext() {
    const metaContent = (sel) => document.querySelector(sel)?.getAttribute('content')?.trim() || '';

    // Full description text lives in the DOM even when the "Show more" expander
    // is collapsed (YouTube only CSS-clips it). textContent returns the full string.
    const descEl =
      document.querySelector('ytd-watch-metadata #description-inline-expander') ||
      document.querySelector('ytd-text-inline-expander #attributed-snippet-text') ||
      document.querySelector('#description.ytd-watch-metadata');
    const description = (descEl?.textContent || '').trim() || metaContent('meta[name="description"]');

    return {
      title: getVideoTitle(),
      description,
      tags: metaContent('meta[name="keywords"]'),
      category: metaContent('meta[itemprop="genre"]'),
    };
  }

  function detectYouTubeDarkTheme() {
    return document.documentElement.getAttribute('dark') !== null ||
      document.body.classList.contains('dark') ||
      (window.getComputedStyle(document.body).backgroundColor || '').includes('rgb(15, 15, 15)') ||
      document.querySelector('html[dark]') !== null;
  }

  function isMissingApiKey(apiKey) {
    return !apiKey || apiKey.trim() === '';
  }

  function clearGenerationMessage() {
    const message = document.querySelector('.ai-comment-generation-message');
    if (!message) return;

    message.style.display = 'none';
    message.textContent = '';
  }

  function openExtensionSettings() {
    const optionsUrl = chrome.runtime.getURL('options/options.html');

    try {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage(() => {
          if (chrome.runtime.lastError) {
            window.open(optionsUrl, '_blank', 'noopener');
          }
        });
        return;
      }
    } catch (error) {
      console.warn('Could not open options page via runtime API:', error);
    }

    window.open(optionsUrl, '_blank', 'noopener');
  }

  function showGenerationMessage(messageText, options = {}) {
    const message = document.querySelector('.ai-comment-generation-message');
    if (!message) return;

    message.textContent = '';

    const text = document.createElement('div');
    text.textContent = messageText;
    message.appendChild(text);

    if (options.showSettingsAction) {
      const settingsButton = document.createElement('button');
      settingsButton.type = 'button';
      settingsButton.textContent = 'Open Settings';
      settingsButton.style.marginTop = '6px';
      settingsButton.style.padding = '5px 8px';
      settingsButton.style.border = 'none';
      settingsButton.style.borderRadius = '3px';
      settingsButton.style.backgroundColor = '#1976d2';
      settingsButton.style.color = '#fff';
      settingsButton.style.cursor = 'pointer';
      settingsButton.style.fontSize = '12px';
      settingsButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openExtensionSettings();
      });
      message.appendChild(settingsButton);
    }

    message.style.display = 'block';
  }

  function findCommentInput() {
    let commentInput = document.querySelector('#contenteditable-root');

    if (!commentInput) {
      console.log('Could not find #contenteditable-root, trying alternative selectors...');
      commentInput = document.querySelector('[contenteditable="true"][aria-label="Додайте коментар…"]');
    }

    if (!commentInput) {
      console.log('Still could not find comment field, trying more selectors...');
      commentInput = document.querySelector('[contenteditable="true"][aria-label="Add a comment…"]');
    }

    if (!commentInput) {
      console.log('Trying to find any contenteditable element in the comment area...');
      const commentArea = document.querySelector('ytd-comments ytd-comment-simplebox-renderer');
      if (commentArea) {
        commentInput = commentArea.querySelector('[contenteditable="true"]');
      }
    }

    return commentInput;
  }

  function insertCommentIntoInput(comment) {
    const commentInput = findCommentInput();

    if (commentInput) {
      commentInput.textContent = comment;
      commentInput.dispatchEvent(new Event('input', { bubbles: true }));
      commentInput.focus();
      return true;
    }

    console.error('Could not find the comment input field');
    alert('Could not find the comment input field. Please try clicking on the comment area first.');
    return false;
  }

  function removeCommentVariantsModal() {
    const existingModal = document.querySelector('.ai-comment-variants-modal-backdrop');
    if (existingModal) {
      existingModal.remove();
    }

    if (commentVariantsEscHandler) {
      document.removeEventListener('keydown', commentVariantsEscHandler);
      commentVariantsEscHandler = null;
    }
  }

  function showCommentVariantsModal(comments, onRegenerate) {
    removeCommentVariantsModal();

    const isDarkTheme = detectYouTubeDarkTheme();
    const backdrop = document.createElement('div');
    backdrop.className = 'ai-comment-variants-modal-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.inset = '0';
    backdrop.style.display = 'flex';
    backdrop.style.alignItems = 'center';
    backdrop.style.justifyContent = 'center';
    backdrop.style.padding = '20px';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.55)';
    backdrop.style.zIndex = '2147483647';

    const modal = document.createElement('div');
    modal.className = 'ai-comment-variants-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.style.width = 'min(920px, calc(100vw - 32px))';
    modal.style.maxHeight = '82vh';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.overflow = 'hidden';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 18px 60px rgba(0, 0, 0, 0.35)';
    modal.style.backgroundColor = isDarkTheme ? '#212121' : '#ffffff';
    modal.style.border = isDarkTheme ? '1px solid #3f3f3f' : '1px solid #d5d5d5';
    modal.style.color = isDarkTheme ? '#ffffff' : '#0f0f0f';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.gap = '12px';
    header.style.padding = '14px 16px';
    header.style.borderBottom = isDarkTheme ? '1px solid #3f3f3f' : '1px solid #e5e5e5';

    const title = document.createElement('div');
    title.textContent = 'Choose a comment';
    title.style.fontSize = '16px';
    title.style.fontWeight = '600';

    const headerActions = document.createElement('div');
    headerActions.style.display = 'flex';
    headerActions.style.alignItems = 'center';
    headerActions.style.gap = '8px';

    let regenerateButton = null;
    if (typeof onRegenerate === 'function') {
      regenerateButton = document.createElement('button');
      regenerateButton.type = 'button';
      regenerateButton.setAttribute('aria-label', 'Regenerate comments');
      regenerateButton.title = 'Regenerate comments';
      regenerateButton.style.display = 'inline-flex';
      regenerateButton.style.alignItems = 'center';
      regenerateButton.style.gap = '6px';
      regenerateButton.style.padding = '6px 12px';
      regenerateButton.style.border = isDarkTheme ? '1px solid #454545' : '1px solid #dddddd';
      regenerateButton.style.borderRadius = '18px';
      regenerateButton.style.backgroundColor = isDarkTheme ? '#2b2b2b' : '#f8f8f8';
      regenerateButton.style.color = isDarkTheme ? '#ffffff' : '#0f0f0f';
      regenerateButton.style.cursor = 'pointer';
      regenerateButton.style.font = 'inherit';
      regenerateButton.style.fontSize = '13px';
      regenerateButton.innerHTML = '<span style="font-size:14px;line-height:1;">↻</span><span>Regenerate</span>';
      regenerateButton.addEventListener('mouseenter', () => {
        regenerateButton.style.backgroundColor = isDarkTheme ? '#3a3a3a' : '#ececec';
      });
      regenerateButton.addEventListener('mouseleave', () => {
        regenerateButton.style.backgroundColor = isDarkTheme ? '#2b2b2b' : '#f8f8f8';
      });
      regenerateButton.addEventListener('click', () => {
        removeCommentVariantsModal();
        try {
          onRegenerate();
        } catch (error) {
          console.error('Regenerate callback failed:', error);
        }
      });
    }

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.style.width = '32px';
    closeButton.style.height = '32px';
    closeButton.style.display = 'inline-flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.backgroundColor = isDarkTheme ? '#303030' : '#f1f1f1';
    closeButton.style.color = isDarkTheme ? '#ffffff' : '#0f0f0f';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '22px';
    closeButton.style.lineHeight = '1';
    closeButton.addEventListener('click', removeCommentVariantsModal);

    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    list.style.alignItems = 'stretch';
    list.style.gap = '10px';
    list.style.padding = '14px 16px 16px';
    list.style.overflowY = 'auto';

    comments.forEach((comment, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.style.width = '100%';
      card.style.minWidth = '0';
      card.style.height = '100%';
      card.style.padding = '12px';
      card.style.textAlign = 'left';
      card.style.borderRadius = '8px';
      card.style.border = isDarkTheme ? '1px solid #454545' : '1px solid #dddddd';
      card.style.backgroundColor = isDarkTheme ? '#2b2b2b' : '#f8f8f8';
      card.style.color = isDarkTheme ? '#ffffff' : '#0f0f0f';
      card.style.cursor = 'pointer';
      card.style.font = 'inherit';
      card.style.transition = 'border-color 0.15s, background-color 0.15s';

      const label = document.createElement('div');
      label.textContent = `Option ${index + 1}`;
      label.style.marginBottom = '6px';
      label.style.fontSize = '12px';
      label.style.fontWeight = '600';
      label.style.color = isDarkTheme ? '#aaa' : '#606060';

      const text = document.createElement('div');
      text.textContent = comment;
      text.style.whiteSpace = 'pre-wrap';
      text.style.fontSize = '14px';
      text.style.lineHeight = '1.45';

      card.appendChild(label);
      card.appendChild(text);

      card.addEventListener('mouseenter', () => {
        card.style.borderColor = '#3ea6ff';
        card.style.backgroundColor = isDarkTheme ? '#333333' : '#ffffff';
      });
      card.addEventListener('mouseleave', () => {
        card.style.borderColor = isDarkTheme ? '#454545' : '#dddddd';
        card.style.backgroundColor = isDarkTheme ? '#2b2b2b' : '#f8f8f8';
      });
      card.addEventListener('click', () => {
        if (insertCommentIntoInput(comment)) {
          removeCommentVariantsModal();
        }
      });

      list.appendChild(card);
    });

    header.appendChild(title);
    if (regenerateButton) {
      headerActions.appendChild(regenerateButton);
    }
    headerActions.appendChild(closeButton);
    header.appendChild(headerActions);
    modal.appendChild(header);
    modal.appendChild(list);
    backdrop.appendChild(modal);

    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        removeCommentVariantsModal();
      }
    });

    commentVariantsEscHandler = (event) => {
      if (event.key === 'Escape') {
        removeCommentVariantsModal();
      }
    };
    document.addEventListener('keydown', commentVariantsEscHandler);

    document.body.appendChild(backdrop);
    closeButton.focus();
  }

  // Function to generate a comment
  function generateComment(mood, selectedLanguage, dropdownMenu) {
    const button = document.querySelector('.ai-comment-generator-btn');
    if (!button) return;

    const originalHTML = button.innerHTML;
    clearGenerationMessage();

    // Collect grounding context (title + description + tags + category)
    const videoContext = getVideoContext();

    // Get default language based on browser settings
    function getDefaultLanguage() {
      const supported = ['uk', 'en', 'pl', 'de', 'fr'];
      const browserLang = navigator.language.substring(0, 2).toLowerCase();
      return supported.includes(browserLang) ? browserLang : 'en';
    }

    // Define default options
    const defaultOptions = {
      language: getDefaultLanguage(),
      provider: 'openai',
      apiKey: '',
      model: '',
      maxTokens: 2000,
      variantCount: 1,
      temperature: 0.5,
      prompt: '**Write a YouTube comment that sounds like a real viewer reacting to the video — react to something specific from the title, description, or tags, not generic praise.**\n\n**CRITICAL — match how people actually write on YouTube:** real comments are NOT polished essays. The majority are quick phone-typed reactions — lowercase starts, missing periods, sentence fragments, conversational tone, sometimes a small typo (a swapped letter, a missing letter, a dropped vowel, a missing comma). Treat this casual / sloppy style as the DEFAULT. Polished, fully-grammatical writing is the exception, not the rule. If a comment reads like a textbook sentence, it is wrong.\n\nStyle choices to pick per comment:\n- **Tone:** enthusiastic, surprised, curious, thoughtful, mildly critical, nostalgic, or sarcastic-but-friendly.\n- **Length:** anywhere from a 3-word reaction to ~25 words. Short offhand reactions are great.\n- **Structure:** a pure reaction, a mention of a specific detail from the video, or close with a short question.\n- **Writing quality:** most of the time casual / phone-typed (lowercase ok, no period at the end is fine, fragments are fine, one tiny typo is fine). Occasionally polished. Never robotic, never essay-style.\n- **Endings:** period, exclamation mark, or no end punctuation — whatever matches the conventions of the target language and feels natural for a quick comment.\n\n**Avoid:**\n- Bot-sounding phrases like "Thanks for the informative content", "Great educational video", "Subscribed!", "Keep up the good work".\n- Hashtags, sign-offs, signatures.\n- Emojis (only if one truly fits a casual variant).\n- Inventing facts that are not implied by the title, description, or tags.'
    };

    // Function to get default model based on provider
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

    chrome.storage.sync.get(defaultOptions, function(options) {
      try {
        if (isMissingApiKey(options.apiKey)) {
          showGenerationMessage('Add an API key in Settings before generating a comment.', {
            showSettingsAction: true
          });
          button.innerHTML = originalHTML;
          button.disabled = false;
          return;
        }
        options.apiKey = options.apiKey.trim();

        // Apply optional language override from dropdown if provided
        if (selectedLanguage && selectedLanguage !== 'default') {
          options.language = selectedLanguage;
        }

        // Set defaults if not present
        if (!options.model) {
          options.model = getDefaultModel(options.provider || 'openai');
        }

        if (!options.maxTokens) {
          options.maxTokens = 2000;
        }

        options.variantCount = normalizeVariantCount(options.variantCount);

        if (options.temperature === undefined) {
          options.temperature = 0.5;
        }

        const basePrompt = options.prompt && options.prompt.trim()
          ? options.prompt
          : defaultOptions.prompt;

        // Build mood instruction if provided (skip for neutral)
        const moodInstruction = mood && mood !== 'neutral'
          ? ` Write the comment in a ${mood} tone.`
          : '';

        const contextLines = [`Video title: "${videoContext.title}".`];
        if (videoContext.description) contextLines.push(`Description: ${videoContext.description}`);
        if (videoContext.tags) contextLines.push(`Tags: ${videoContext.tags}`);
        if (videoContext.category) contextLines.push(`Category: ${videoContext.category}`);

        options.prompt = `${basePrompt}\n\n${contextLines.join('\n')}${moodInstruction}`;

        if (dropdownMenu) {
          dropdownMenu.style.display = 'none';
        }

        button.innerHTML = '⏳ Generating...';
        button.disabled = true;

        // Send request to generate a comment
        chrome.runtime.sendMessage(
          {
            action: 'generateComment',
            options: options
          },
          function (response) {
            if (button) {
              button.innerHTML = originalHTML;
              button.disabled = false;
            }

            if (response && response.success) {
              const comments = Array.isArray(response.comments) && response.comments.length > 0
                ? response.comments
                : [response.comment].filter(Boolean);

              if (options.variantCount > 1 && comments.length > 0) {
                showCommentVariantsModal(comments, () => {
                  generateComment(mood, selectedLanguage, dropdownMenu);
                });
              } else if (comments.length > 0) {
                insertCommentIntoInput(comments[0]);
              } else {
                alert('Error: Failed to generate comment');
              }
            } else {
              alert(`Error: ${response?.error || 'Failed to generate comment'}`);
            }
          }
        );
      } catch (error) {
        console.error('Error in comment generation:', error);
        if (button) {
          button.innerHTML = originalHTML;
          button.disabled = false;
        }
        alert('Error: ' + error.message);
      }
    });
  }

  // Function to clear previous listeners
  function clearPreviousListeners() {
    buttonAdded = false;
    removeCommentVariantsModal();

    // Clear previous interval
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }

    // Disconnect previous observer
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    // Remove all existing buttons
    const existingButtons = document.querySelectorAll('.ai-comment-generator-btn');
    existingButtons.forEach(btn => btn.remove());
  }

  // Function to check for comment input focus and add button when needed
  function setupCommentFocusListener() {
    // Find all possible comment input fields
    const possibleInputs = [
      '#contenteditable-root',
      '[contenteditable="true"][aria-label="Додайте коментар…"]',
      '[contenteditable="true"][aria-label="Add a comment…"]',
      'ytd-comments [contenteditable="true"]'
    ];

    // Add focus event listeners to all possible inputs
    possibleInputs.forEach(selector => {
      document.addEventListener('focusin', (event) => {
        // Check if the focused element matches our selectors
        if (event.target.matches(selector) || event.target.closest(selector)) {
          // Wait a short time for YouTube to render its buttons
          setTimeout(() => {
            if (!buttonAdded) {
              addGenerateButton();
            }
          }, 300);
        }
      });
    });

    // Also check periodically for the buttons container
    let attempts = 0;
    checkInterval = setInterval(() => {
      attempts++;

      // Try to add the button if it's not already added
      if (!buttonAdded) {
        addGenerateButton();
      }

      // If 30 seconds (15 attempts) have passed and the button is not added, stop the interval
      if (attempts >= 15 || buttonAdded) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    }, 2000);
  }

  // Setup the focus listener
  setupCommentFocusListener();

  // Also check when DOM changes, but only if the button has not been added yet
  observer = new MutationObserver((_mutations) => {
    if (!buttonAdded) {
      addGenerateButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Start the button adding function
addGenerateButton();

// Also run the function when URL changes (for SPA)
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed, adding button again');
    addGenerateButton();
  }
});

urlObserver.observe(document, { subtree: true, childList: true });

// Add message handler from popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'checkYouTube') {
    sendResponse({ isYouTube: window.location.hostname.includes('youtube.com') });
  }
  return true; // Required for asynchronous response
});
