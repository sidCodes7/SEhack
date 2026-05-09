/**
 * AquaSentinel — Grok API Client
 * 
 * Centralized wrapper for all Grok LLM calls via OpenAI-compatible SDK.
 * All agent files MUST use this wrapper — never import `openai` directly.
 * 
 * Uses Grok 4.3 model via x.ai API endpoint.
 */

import OpenAI from 'openai';

let _grok = null;

function getGrokClient() {
  if (!_grok) {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      throw new Error('XAI_API_KEY environment variable is not set. Please add it to your .env file.');
    }
    _grok = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    });
  }
  return _grok;
}

/**
 * Make a single-turn Grok completion call.
 * 
 * @param {string} systemPrompt - System message defining the agent persona
 * @param {string} userMessage - User/data input for this call
 * @param {Object} options - Optional overrides
 * @param {number} [options.temperature=0.3] - Response randomness (low = deterministic)
 * @param {number} [options.maxTokens=2000] - Max response tokens
 * @param {boolean} [options.json=false] - If true, request JSON response format
 * @returns {Promise<string>} The model's response content
 */
export async function callGrok(systemPrompt, userMessage, options = {}) {
  const response = await getGrokClient().chat.completions.create({
    model: 'grok-4-1-fast-reasoning',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 2000,
    response_format: options.json ? { type: 'json_object' } : undefined,
  });
  return response.choices[0].message.content;
}

/**
 * Make a streaming Grok completion call.
 * Used by the Brief Agent for chat responses.
 * 
 * @param {string} systemPrompt - System message
 * @param {string} userMessage - User query
 * @returns {Promise<AsyncIterable>} OpenAI streaming response object
 */
export async function streamGrok(systemPrompt, userMessage) {
  return getGrokClient().chat.completions.create({
    model: 'grok-4-1-fast-reasoning',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    stream: true,
    temperature: 0.4,
  });
}

/**
 * Quick connectivity test — verifies the Grok API key and endpoint work.
 * @returns {Promise<{success: boolean, message: string, model: string}>}
 */
export async function testGrokConnection() {
  try {
    const response = await getGrokClient().chat.completions.create({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        { role: 'system', content: 'You are a test responder.' },
        { role: 'user', content: 'Respond with exactly: {"status":"ok","agent":"AquaSentinel"}' },
      ],
      temperature: 0,
      max_tokens: 50,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    return {
      success: true,
      message: 'Grok API connection successful',
      model: response.model,
      response: content,
    };
  } catch (error) {
    return {
      success: false,
      message: `Grok API connection failed: ${error.message}`,
      model: null,
      response: null,
    };
  }
}

export default getGrokClient;
