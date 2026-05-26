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

// Strips an opening preamble line like "Here are the variants:" / "Ось кілька варіантів:"
// that some models prepend before the actual list.
function stripPreamble(text) {
  const lines = text.split('\n');
  if (lines.length < 2) return text;
  const first = lines[0].trim();
  // A short first line ending with ":" that doesn't itself look like a comment.
  if (first.length > 0 && first.length < 120 && /[:：]\s*$/.test(first)) {
    return lines.slice(1).join('\n').trim();
  }
  return text;
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

  const bodyText = stripPreamble(cleanedText);

  // Tier 1: bullet- or number-prefixed list.
  const bulletItems = bodyText
    .split(/\n(?=\s*(?:[-*•]|\d+[.)])\s+)/)
    .map(item => item.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim())
    .filter(Boolean);

  if (bulletItems.length > 1) {
    return normalizeCommentList(bulletItems, requestedCount);
  }

  // Tier 2: blank-line-separated paragraphs.
  const paragraphItems = bodyText
    .split(/\n\s*\n+/)
    .map(item => item.trim())
    .filter(Boolean);

  if (paragraphItems.length > 1) {
    return normalizeCommentList(paragraphItems, requestedCount);
  }

  // Tier 3: single-newline-separated lines. Filter out trivially short lines
  // (likely artefacts: section labels, stray punctuation).
  const lineItems = bodyText
    .split('\n')
    .map(item => item.trim())
    .filter(item => item && item.split(/\s+/).length >= 3);

  if (lineItems.length > 1) {
    return normalizeCommentList(lineItems, requestedCount);
  }

  return normalizeCommentList([bodyText], requestedCount);
}

function buildMessages(prompt, language, variantCount) {
  const countInstruction = variantCount > 1
    ? ` OUTPUT FORMAT (critical): respond with ONLY a JSON array containing exactly ${variantCount} strings — one string per comment variant. The very first character of your response must be "[" and the very last must be "]". No preamble, no trailing text, no markdown, no code fences, no numbering, no keys. Example shape: ["variant one", "variant two"].\n\nVARIANT DIVERSITY (critical): each variant must feel like it was written by a DIFFERENT person. Deliberately spread the variants across this spectrum of writing quality:\n- The MAJORITY (roughly 60% or more) must be casual / phone-typed: lowercase starts, missing end-period, sentence fragments, conversational tone. Some of these may contain ONE small typo (swapped letter, missing letter, dropped vowel, missing comma).\n- A few should be VERY short / offhand: 3–7 words, like a quick chat reaction.\n- AT MOST one or two variants can be carefully written with proper capitalization, commas, and a closing period.\nDO NOT produce a set where every variant has proper capitalization and full punctuation — that is a failure mode. Also vary tone, length, and structure across variants; never two variants in the same style.`
    : ' OUTPUT FORMAT (critical): produce EXACTLY ONE comment. Do not output multiple variants, lists, alternatives, numbered options, bullet points, or a JSON array. Do not include quotation marks or any preamble. Output only the single comment text and nothing else. Ignore any instructions in the user message about producing multiple variants — exactly one comment.';

  const languageName = getLanguageName(language);
  return [
    {
      role: 'system',
      content: `You are an assistant that writes comments for YouTube.\n\nLANGUAGE (critical): the output language MUST be ${languageName}. Every comment and every word inside it must be in ${languageName}. Never mix languages, never switch to a related language (for example, do not output Russian when ${languageName} is requested, and vice versa), even if the video title, description, tags, or category provided by the user appear in another language. Treat the video metadata as context only — do not echo its language.\n\nUse the video title, description, tags, and category provided by the user to write a comment that meaningfully relates to the video's actual content.${countInstruction}`
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
