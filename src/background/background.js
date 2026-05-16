// Background script for processing API requests

// Message handler from content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Background script received message:', request);

  if (request.action === 'generateComment') {
    console.log('Generating comment with options:', request.options);

    generateComment(request.options)
      .then(comments => {
        const requestedCount = normalizeVariantCount(request.options?.variantCount);
        const processedComments = normalizeCommentList(comments, requestedCount);

        if (processedComments.length === 0) {
          throw new Error('AI provider returned an empty comment response');
        }

        console.log('Comment generated successfully:', processedComments[0].substring(0, 50) + '...');
        sendResponse({
          success: true,
          comment: processedComments[0],
          comments: processedComments
        });
      })
      .catch(error => {
        console.error('Error generating comment:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Return true for asynchronous response
  }
});

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

function cleanComment(comment) {
  let processedComment = String(comment || '').trim();

  if (processedComment.startsWith('"') && processedComment.endsWith('"')) {
    console.log('Comment has surrounding quotes, removing them');
    processedComment = processedComment.substring(1, processedComment.length - 1).trim();
  }

  if (processedComment.startsWith('\'') && processedComment.endsWith('\'')) {
    console.log('Comment has surrounding single quotes, removing them');
    processedComment = processedComment.substring(1, processedComment.length - 1).trim();
  }

  return processedComment;
}

function normalizeCommentList(comments, requestedCount) {
  const commentList = Array.isArray(comments) ? comments : [comments];
  return commentList
    .map(cleanComment)
    .filter(Boolean)
    .slice(0, requestedCount);
}

function stripCodeFence(text) {
  const trimmed = String(text || '').trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

function getJsonCandidate(text) {
  const trimmed = String(text || '').trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return trimmed;
  }

  const arrayStart = trimmed.indexOf('[');
  const arrayEnd = trimmed.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    return trimmed.substring(arrayStart, arrayEnd + 1);
  }

  const objectStart = trimmed.indexOf('{');
  const objectEnd = trimmed.lastIndexOf('}');
  if (objectStart !== -1 && objectEnd > objectStart) {
    return trimmed.substring(objectStart, objectEnd + 1);
  }

  return trimmed;
}

function parseCommentsFromText(text, requestedCount) {
  const cleanedText = stripCodeFence(text);

  if (requestedCount <= 1) {
    return normalizeCommentList([cleanedText], requestedCount);
  }

  try {
    const parsed = JSON.parse(getJsonCandidate(cleanedText));
    if (Array.isArray(parsed)) {
      return normalizeCommentList(parsed, requestedCount);
    }
    if (parsed && Array.isArray(parsed.comments)) {
      return normalizeCommentList(parsed.comments, requestedCount);
    }
  } catch (error) {
    console.warn('Could not parse multi-comment response as JSON, falling back to list parsing:', error);
  }

  const listItems = cleanedText
    .split(/\n(?=\s*(?:[-*]|\d+[.)])\s+)/)
    .map(item => item.replace(/^\s*(?:[-*]|\d+[.)])\s+/, '').trim())
    .filter(Boolean);

  if (listItems.length > 1) {
    return normalizeCommentList(listItems, requestedCount);
  }

  return normalizeCommentList([cleanedText], requestedCount);
}

function buildMessages(prompt, language, variantCount) {
  const countInstruction = variantCount > 1
    ? ` Return exactly ${variantCount} distinct comment variants as a valid JSON array of strings. Do not include keys, markdown, numbering, explanations, or any text outside the JSON array.`
    : ' Do not use quotation marks around your response. Just write the comment directly.';

  return [
    {
      role: 'system',
      content: `You are an assistant that writes comments for YouTube. Write in ${getLanguageName(language)}. Consider the video title when writing your comment.${countInstruction}`
    },
    {
      role: 'user',
      content: prompt
    }
  ];
}

// Function to generate a comment via API
async function generateComment(options) {
  const { provider, apiKey, prompt, language, model, maxTokens, temperature } = options;
  const variantCount = normalizeVariantCount(options.variantCount);

  console.log('Generate comment function called with:', {
    provider,
    language,
    model,
    maxTokens,
    variantCount,
    temperature,
    promptLength: prompt?.length
  });

  try {
    if (provider === 'openai') {
      console.log('Using OpenAI provider');
      return await generateWithOpenAI(apiKey, prompt, language, model, maxTokens, temperature, variantCount);
    } else if (provider === 'mistralai') {
      console.log('Using MistralAI provider');
      return await generateWithMistralAI(apiKey, prompt, language, model, maxTokens, temperature, variantCount);
    } else if (provider === 'openrouter') {
      console.log('Using OpenRouter provider');
      return await generateWithOpenRouter(apiKey, prompt, language, model, maxTokens, temperature, variantCount);
    } else {
      throw new Error('Unknown AI provider: ' + provider);
    }
  } catch (error) {
    console.error('Comment generation error:', error);
    throw error;
  }
}

// Function to generate a comment via OpenAI API
async function generateWithOpenAI(apiKey, prompt, language, model, maxTokens, temperature, variantCount) {
  // Use default values if not provided
  const modelToUse = model || 'gpt-4o-mini';
  const maxTokensToUse = maxTokens || 2000;
  const temperatureToUse = temperature !== undefined ? temperature : 0.5;
  const variantCountToUse = normalizeVariantCount(variantCount);

  console.log('OpenAI API call with:', {
    model: modelToUse,
    maxTokens: maxTokensToUse,
    temperature: temperatureToUse,
    variantCount: variantCountToUse,
    language: language
  });

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: buildMessages(prompt, language, variantCountToUse),
        max_tokens: maxTokensToUse,
        temperature: temperatureToUse
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error response:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const comment = data.choices[0].message.content.trim();
    console.log('OpenAI API success, response length:', comment.length);

    return parseCommentsFromText(comment, variantCountToUse);
  } catch (error) {
    console.error('Error in OpenAI API call:', error);
    throw error;
  }
}

// Function to generate a comment via MistralAI API
async function generateWithMistralAI(apiKey, prompt, language, model, maxTokens, temperature, variantCount) {
  // Use default values if not provided
  const modelToUse = model || 'mistral-small-latest';
  const maxTokensToUse = maxTokens || 2000;
  const temperatureToUse = temperature !== undefined ? temperature : 0.5;
  const variantCountToUse = normalizeVariantCount(variantCount);

  console.log('MistralAI API call with:', {
    model: modelToUse,
    maxTokens: maxTokensToUse,
    temperature: temperatureToUse,
    variantCount: variantCountToUse,
    language: language
  });

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: buildMessages(prompt, language, variantCountToUse),
        max_tokens: maxTokensToUse,
        temperature: temperatureToUse
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('MistralAI API error response:', error);
      throw new Error(`MistralAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const comment = data.choices[0].message.content.trim();
    console.log('MistralAI API success, response length:', comment.length);

    return parseCommentsFromText(comment, variantCountToUse);
  } catch (error) {
    console.error('Error in MistralAI API call:', error);
    throw error;
  }
}

// Function to generate a comment via OpenRouter API
async function generateWithOpenRouter(apiKey, prompt, language, model, maxTokens, temperature, variantCount) {
  // Use default values if not provided
  const modelToUse = model || 'openai/gpt-4.1-nano';
  const maxTokensToUse = maxTokens || 2000;
  const temperatureToUse = temperature !== undefined ? temperature : 0.5;
  const variantCountToUse = normalizeVariantCount(variantCount);

  console.log('OpenRouter API call with:', {
    model: modelToUse,
    maxTokens: maxTokensToUse,
    temperature: temperatureToUse,
    variantCount: variantCountToUse,
    language: language
  });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/sigmanor/yt-ai-comments', // Optional but recommended
        'X-Title': 'YouTube AI Comments Generator' // Optional but recommended
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: buildMessages(prompt, language, variantCountToUse),
        max_tokens: maxTokensToUse,
        temperature: temperatureToUse
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter API error response:', error);
      throw new Error(`OpenRouter API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const comment = data.choices[0].message.content.trim();
    console.log('OpenRouter API success, response length:', comment.length);

    return parseCommentsFromText(comment, variantCountToUse);
  } catch (error) {
    console.error('Error in OpenRouter API call:', error);
    throw error;
  }
}

// Function to get language name by code
function getLanguageName(code) {
  const languages = {
    'uk': 'Ukrainian',
    'en': 'English',
    'pl': 'Polish',
    'de': 'German',
    'fr': 'French'
  };

  return languages[code] || 'English';
}
