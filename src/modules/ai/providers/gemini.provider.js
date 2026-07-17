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

/**
 * Sends a code review completion request using Google Gemini generateContent with JSON response schema.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<object>} The parsed structured response.
 */
const getCodeReview = async (systemPrompt, userPrompt) => {
  const client = getGeminiClient();

  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    throw new AppError(
      'Gemini API key is not configured. Please set a valid GEMINI_API_KEY in the environment settings.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  try {
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    logger.info(`Sending content generation request to Gemini using model=${model}`);

    const response = await client.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: analyzeResponseSchema,
      }
    });

    if (!response.text) {
      // Check if response was blocked or finished incorrectly
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new AppError('The code review content was blocked by Gemini safety filters.', 400, 'CONTENT_BLOCKED');
      }
      throw new AppError('Gemini returned an empty review response.', 502, 'BAD_GATEWAY');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(response.text);
    } catch (err) {
      logger.error('Failed to parse Gemini JSON output:', response.text);
      throw new AppError('Gemini returned an invalid structured JSON response.', 502, 'BAD_GATEWAY');
    }

    // Validate confidence score range
    if (typeof parsedResult.confidenceScore === 'number') {
      if (parsedResult.confidenceScore < 0 || parsedResult.confidenceScore > 100) {
        parsedResult.confidenceScore = Math.max(0, Math.min(100, parsedResult.confidenceScore));
      }
    } else {
      parsedResult.confidenceScore = 80; // default
    }

    return {
      result: parsedResult,
      modelUsed: model,
    };
  } catch (err) {
    logger.error('Error during Gemini API content generation:', err);

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

      if (err.status === 400) {
        if (message.includes('API key')) {
          throw new AppError('Gemini Authentication failed: The configured API key is invalid.', 401, 'UNAUTHORIZED');
        }
        throw new AppError(`Invalid request payload: ${message}`, 400, 'BAD_REQUEST');
      }
      if (err.status === 403) {
        throw new AppError('Access Denied: The model is not accessible or API usage is blocked.', 403, 'FORBIDDEN');
      }
      if (err.status === 429 || (err.status === 403 && message.includes('quota'))) {
        throw new AppError('Gemini quota or rate limits exceeded. Please retry in a few seconds.', 429, 'TOO_MANY_REQUESTS');
      }
      if (err.status === 408) {
        throw new AppError('Gemini request timed out. Please try again.', 504, 'GATEWAY_TIMEOUT');
      }
      throw new AppError(`Gemini API Error: ${message}`, err.status || 502, 'BAD_GATEWAY');
    }

    throw new AppError(`Failed to retrieve Gemini code review: ${err.message}`, 502, 'BAD_GATEWAY');
  }
};

module.exports = {
  getCodeReview,
};
