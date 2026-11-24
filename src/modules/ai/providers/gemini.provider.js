const { GoogleGenAI } = require('@google/genai');
const env = require('../../../config/env');
const logger = require('../../../utils/logger');
const { AppError } = require('../../../errors/AppError');
const { analyzeResponseSchema } = require('../ai.schema');

let genaiClient = null;

const getGeminiClient = () => {
  if (!genaiClient) {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      logger.warn('Gemini API Key is missing or set to placeholder "your_gemini_api_key_here".');
    }
    genaiClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
  }
  return genaiClient;
};

const isConfigured = () =>
  Boolean(env.GEMINI_API_KEY) && !['your_gemini_api_key', 'your_gemini_api_key_here'].includes(env.GEMINI_API_KEY);

/**
 * Sends a structured generation request to Gemini and returns the parsed JSON.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @param {object} schema JSON schema for the response.
 * @param {{ timeoutMs?: number, temperature?: number, model?: string }} [options]
 * @returns {Promise<{ result: object, modelUsed: string }>}
 */
const generateStructured = async (systemPrompt, userPrompt, schema, { timeoutMs = 120000, temperature, model: modelOverride } = {}) => {
  if (!isConfigured()) {
    throw new AppError(
      'The AI service is not configured. Please set a valid GEMINI_API_KEY in the environment settings.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  const client = getGeminiClient();

  try {
    const model = modelOverride || env.GEMINI_MODEL || 'gemini-2.5-flash';
    logger.info(`Sending content generation request to Gemini using model=${model}`);

    const response = await client.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: schema,
        ...(temperature !== undefined ? { temperature } : {}),
        httpOptions: { timeout: timeoutMs },
      }
    });

    if (!response.text) {
      // Check if response was blocked or finished incorrectly
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new AppError('The AI could not process this content because of its safety filters.', 400, 'CONTENT_BLOCKED');
      }
      throw new AppError('The AI returned an empty response. Please try again.', 502, 'BAD_GATEWAY');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(response.text);
    } catch (err) {
      logger.error(`Failed to parse Gemini JSON output (finishReason=${response.candidates?.[0]?.finishReason})`);
      throw new AppError('The AI returned an invalid response. Please try again.', 502, 'BAD_GATEWAY');
    }

    return {
      result: parsedResult,
      modelUsed: model,
    };
  } catch (err) {
    logger.error(`Error during Gemini API content generation: ${err.message}`);

    // If it's already an AppError, rethrow it
    if (err instanceof AppError) {
      throw err;
    }

    // Capture standard Gemini ApiError
    if (err.name === 'ApiError') {
      let message = err.message;
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error && parsed.error.message) {
          message = parsed.error.message;
        }
      } catch (pe) {
        // use default message
      }

      // Client-facing messages stay provider-neutral; the raw error is logged above
      if (err.status === 400) {
        if (message.includes('API key')) {
          throw new AppError('The AI service is not configured correctly (invalid API key).', 401, 'UNAUTHORIZED');
        }
        throw new AppError('The AI service could not process this request.', 400, 'BAD_REQUEST');
      }
      if (err.status === 429 || (err.status === 403 && message.includes('quota'))) {
        if (isLongQuotaWait(err.message)) {
          throw new AppError(
            'The AI service has reached its usage limit for now. Please try again later.',
            503,
            'AI_QUOTA_EXCEEDED'
          );
        }
        throw new AppError('The AI service is receiving too many requests. Please retry in a few seconds.', 429, 'TOO_MANY_REQUESTS');
      }
      if (err.status === 403) {
        throw new AppError('Access to the AI service is blocked. Please check the API configuration.', 403, 'FORBIDDEN');
      }
      if (err.status === 408) {
        throw new AppError('The AI service timed out. Please try again.', 504, 'GATEWAY_TIMEOUT');
      }
      if (err.status === 503) {
        throw new AppError('The AI service is busy right now. Please try again in a few minutes.', 503, 'SERVICE_UNAVAILABLE');
      }
      throw new AppError('The AI service returned an error. Please try again.', err.status || 502, 'BAD_GATEWAY');
    }

    throw new AppError('Could not reach the AI service. Please try again.', 502, 'BAD_GATEWAY');
  }
};

// A daily quota (or a suggested wait of minutes or more) will not clear with a short retry
const isLongQuotaWait = (raw = '') => {
  if (/per ?day/i.test(raw)) return true;
  const match = raw.match(/retry(?:Delay"?\s*:\s*"|\s+in\s+)(\d+(?:\.\d+)?)\s*(h|m|s)/i);
  if (!match) return false;
  const seconds = Number(match[1]) * ({ h: 3600, m: 60, s: 1 }[match[2].toLowerCase()]);
  return seconds >= 120;
};

// Overload, rate-limit, timeout and bad-output errors are worth a short retry
const TRANSIENT_STATUS = [429, 502, 503, 504];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * generateStructured with retries and backoff for transient failures.
 * @param {{ retries?: number, timeoutMs?: number, temperature?: number }} [options]
 */
// Primary model first, then the optional comma-separated GEMINI_FALLBACK_MODELS
const modelChain = () => [
  ...new Set(
    [env.GEMINI_MODEL || 'gemini-2.5-flash', ...(env.GEMINI_FALLBACK_MODELS || '').split(',')]
      .map((m) => m.trim())
      .filter(Boolean)
  ),
];

// Overload, quota and unavailable-model errors are worth trying on the next model
const isModelSpecific = (err) =>
  err instanceof AppError && ([429, 503, 404].includes(err.statusCode) || err.code === 'AI_QUOTA_EXCEEDED');

/**
 * generateStructured with retries and backoff for transient failures. When the
 * current model is overloaded or out of quota, the next fallback model is tried.
 * @param {{ retries?: number, timeoutMs?: number, temperature?: number }} [options]
 */
const generateStructuredWithRetry = async (systemPrompt, userPrompt, schema, { retries = 2, ...options } = {}) => {
  const models = modelChain();
  let modelIndex = 0;
  let retriesLeft = retries;
  for (;;) {
    try {
      return await generateStructured(systemPrompt, userPrompt, schema, { ...options, model: models[modelIndex] });
    } catch (err) {
      if (isModelSpecific(err) && modelIndex < models.length - 1) {
        modelIndex += 1;
        logger.warn(`AI request failed with ${err.statusCode}; switching to fallback model ${models[modelIndex]}`);
        continue;
      }
      const transient =
        err instanceof AppError && TRANSIENT_STATUS.includes(err.statusCode) && err.code !== 'AI_QUOTA_EXCEEDED';
      if (!transient || retriesLeft <= 0) throw err;
      retriesLeft -= 1;
      // Retry from the primary model after a backoff
      modelIndex = 0;
      const delay = 1500 * 2 ** (retries - retriesLeft - 1) + Math.floor(Math.random() * 500);
      logger.warn(`AI request failed with ${err.statusCode}; retry ${retries - retriesLeft}/${retries} in ${delay}ms`);
      await sleep(delay);
    }
  }
};

/**
 * Code review using the analysis schema; clamps the confidence score.
 */
const getCodeReview = async (systemPrompt, userPrompt) => {
  const { result, modelUsed } = await generateStructured(systemPrompt, userPrompt, analyzeResponseSchema);
  if (typeof result.confidenceScore === 'number') {
    result.confidenceScore = Math.max(0, Math.min(100, Math.round(result.confidenceScore)));
  } else {
    result.confidenceScore = 70;
  }
  return { result, modelUsed };
};

module.exports = {
  isConfigured,
  generateStructured,
  generateStructuredWithRetry,
  getCodeReview,
};
