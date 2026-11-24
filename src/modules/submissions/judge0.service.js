const env = require('../../config/env');
const logger = require('../../utils/logger');
const { AppError } = require('../../errors/AppError');

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (env.JUDGE0_API_KEY) {
    if (env.JUDGE0_API_URL.includes('rapidapi.com')) {
      headers['x-rapidapi-key'] = env.JUDGE0_API_KEY;
      try {
        const host = new URL(env.JUDGE0_API_URL).hostname;
        headers['x-rapidapi-host'] = host;
      } catch (err) {
        logger.error('Failed to parse JUDGE0_API_URL host:', err);
      }
    } else {
      headers['X-Auth-Token'] = env.JUDGE0_API_KEY;
    }
  }
  
  return headers;
};

const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        logger.warn(`Judge0 API rate limited. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      const responseBody = await response.text();
      throw new Error(`Judge0 API responded with status ${response.status}: ${responseBody}`);
    }
    return response;
  } catch (err) {
    if (retries > 0) {
      logger.warn(`Judge0 request failed: ${err.message}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
};

const decodeBase64 = (str) => {
  if (!str) return null;
  try {
    return Buffer.from(str, 'base64').toString('utf8');
  } catch (err) {
    logger.error('Error decoding base64 value:', err);
    return str;
  }
};

const encodeBase64 = (str) => {
  if (str === null || str === undefined) return null;
  return Buffer.from(str.toString()).toString('base64');
};

const submitCode = async ({ sourceCode, languageId, stdin, expectedOutput }) => {
  try {
    const url = `${env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`;
    const payload = {
      source_code: encodeBase64(sourceCode),
      language_id: languageId,
      stdin: encodeBase64(stdin),
      expected_output: encodeBase64(expectedOutput),
    };

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.token) {
      throw new AppError('Failed to retrieve token from Judge0 submission', 502, 'BAD_GATEWAY');
    }

    return { token: data.token };
  } catch (err) {
    logger.error('Error in Judge0 submitCode:', err);
    throw new AppError(`Code execution submission failed: ${err.message}`, 502, 'BAD_GATEWAY');
  }
};

const getSubmission = async (token) => {
  try {
    const url = `${env.JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`;
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    return {
      statusId: data.status?.id || null,
      statusDescription: data.status?.description || null,
      stdout: decodeBase64(data.stdout),
      stderr: decodeBase64(data.stderr),
      compileOutput: decodeBase64(data.compile_output),
      executionTime: data.time ? parseFloat(data.time) : null,
      executionMemory: data.memory ? parseInt(data.memory, 10) : null,
    };
  } catch (err) {
    logger.error(`Error in Judge0 getSubmission for token ${token}:`, err);
    throw new AppError(`Failed to fetch code execution results: ${err.message}`, 502, 'BAD_GATEWAY');
  }
};

const pollSubmission = async (token, maxAttempts = 20, interval = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await getSubmission(token);
    // statusId < 3 represents queueing or processing states (1 = In Queue, 2 = Processing)
    if (result.statusId && result.statusId >= 3) {
      return result;
    }
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
  return getSubmission(token);
};

const RESULT_FIELDS = 'token,stdout,stderr,compile_output,message,status,time,memory';
const MAX_BATCH_SIZE = 20; // Judge0 default max_batch_size

const formatResult = (data) => ({
  token: data.token,
  statusId: data.status?.id || null,
  statusDescription: data.status?.description || null,
  stdout: decodeBase64(data.stdout),
  stderr: decodeBase64(data.stderr),
  compileOutput: decodeBase64(data.compile_output),
  message: decodeBase64(data.message),
  executionTime: data.time ? parseFloat(data.time) : null,
  executionMemory: data.memory ? parseInt(data.memory, 10) : null,
});

/**
 * Run several programs (one per test case) through Judge0's batch API and wait
 * for all of them to finish.
 * @param {Array<{sourceCode: string, languageId: number, stdin?: string}>} runs
 * @returns {Promise<Array<object>>} Results in the same order as `runs`.
 */
const runBatch = async (runs, { maxAttempts = 30, interval = 1000 } = {}) => {
  if (!runs.length) return [];
  try {
    const results = [];
    for (let offset = 0; offset < runs.length; offset += MAX_BATCH_SIZE) {
      const chunk = runs.slice(offset, offset + MAX_BATCH_SIZE);
      const createRes = await fetchWithRetry(`${env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          submissions: chunk.map((r) => ({
            source_code: encodeBase64(r.sourceCode),
            language_id: r.languageId,
            stdin: encodeBase64(r.stdin ?? ''),
          })),
        }),
      });
      const created = await createRes.json();
      const tokens = created.map((c) => c.token);
      if (tokens.some((t) => !t)) {
        throw new Error(`Judge0 rejected a batch item: ${JSON.stringify(created)}`);
      }

      let finished = null;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        const pollRes = await fetchWithRetry(
          `${env.JUDGE0_API_URL}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=true&fields=${RESULT_FIELDS}`,
          { method: 'GET', headers: getHeaders() }
        );
        const body = await pollRes.json();
        const subs = body.submissions || [];
        if (subs.length === tokens.length && subs.every((x) => x.status && x.status.id >= 3)) {
          finished = subs;
          break;
        }
      }
      if (!finished) {
        throw new Error('Timed out waiting for Judge0 to finish executing the code');
      }
      results.push(...finished.map(formatResult));
    }
    return results;
  } catch (err) {
    logger.error(`Error in Judge0 runBatch (${env.JUDGE0_API_URL}): ${err.message}`);
    if (err instanceof AppError) throw err;
    if (/fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT/i.test(err.message)) {
      throw new AppError(
        `Could not reach the code runner (Judge0) at ${env.JUDGE0_API_URL}. Check JUDGE0_API_URL in the backend .env (for example https://ce.judge0.com) and restart the backend.`,
        503,
        'SERVICE_UNAVAILABLE'
      );
    }
    if (/status 429/.test(err.message)) {
      throw new AppError('The code runner is busy (rate limited). Please wait a few seconds and try again.', 429, 'TOO_MANY_REQUESTS');
    }
    throw new AppError(`Code execution failed: ${err.message}`, 502, 'BAD_GATEWAY');
  }
};

module.exports = {
  submitCode,
  getSubmission,
  pollSubmission,
  runBatch,
};
