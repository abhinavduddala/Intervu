const logger = require('../../utils/logger');
const { NotFoundError, ValidationError, ForbiddenError } = require('../../errors/AppError');
const questionsRepository = require('../questions/questions.repository');
const submissionsRepository = require('../submissions/submissions.repository');
const judge0Service = require('../submissions/judge0.service');
const geminiProvider = require('../ai/providers/gemini.provider');
const aiPrompt = require('../ai/ai.prompt');
const { problemContentSchema } = require('../ai/ai.schema');
const workspaceRepository = require('./workspace.repository');
const { LANGUAGE_KEYS, GENERIC_TEMPLATES, getLanguage, listLanguages } = require('./languages');
const { evaluate } = require('./workspace.judge');

const MAX_TEST_CASES = 15;
const inflightGenerations = new Map();

const getQuestionOrThrow = async (questionId) => {
  const question = await questionsRepository.findById(questionId);
  if (!question) throw new NotFoundError(`Question with ID ${questionId} not found`);
  return question;
};

const getLanguageOrThrow = (key) => {
  const lang = getLanguage(key);
  if (!lang) throw new ValidationError(`Unsupported language "${key}". Use one of: ${LANGUAGE_KEYS.join(', ')}`);
  return lang;
};

/**
 * Clean up model output so the rest of the code can rely on its shape.
 */
const sanitizeContent = (raw) => {
  const str = (v) => (typeof v === 'string' ? v : v == null ? '' : String(v));
  const testCases = (Array.isArray(raw.testCases) ? raw.testCases : [])
    .filter((t) => t && typeof t.input === 'string' && typeof t.expectedOutput === 'string')
    .slice(0, MAX_TEST_CASES)
    .map((t, i) => ({ input: t.input, expectedOutput: t.expectedOutput, hidden: i < 3 ? false : Boolean(t.hidden) }));

  const starterCode = {};
  LANGUAGE_KEYS.forEach((k) => {
    const code = raw.starterCode?.[k];
    starterCode[k] = typeof code === 'string' && code.trim() ? code : GENERIC_TEMPLATES[k];
  });

  return {
    description: str(raw.description),
    inputFormat: str(raw.inputFormat),
    outputFormat: str(raw.outputFormat),
    constraints: (Array.isArray(raw.constraints) ? raw.constraints : []).map(str),
    examples: (Array.isArray(raw.examples) ? raw.examples : []).map((e) => ({
      input: str(e.input),
      output: str(e.output),
      explanation: str(e.explanation),
    })),
    testCases,
    starterCode,
  };
};

const generateProblemContent = async (question) => {
  const { systemPrompt, userPrompt } = aiPrompt.generateProblemPrompt(question);
  const { result, modelUsed } = await geminiProvider.generateStructured(systemPrompt, userPrompt, problemContentSchema, {
    timeoutMs: 180000,
    temperature: 0.2,
  });
  const content = sanitizeContent(result);
  if (!content.testCases.length) {
    throw new Error('Gemini returned no usable test cases');
  }
  await workspaceRepository.saveProblemContent(question.id, content, modelUsed);
  logger.info(`Generated workspace problem content for question=${question.id} (${content.testCases.length} tests)`);
  return { content, modelName: modelUsed };
};

/**
 * Load the judged problem (statement, tests, starter code) for a question.
 * Generates it with Gemini on first use and caches it in PostgreSQL.
 * @returns {Promise<{content: object|null, modelName: string|null, error?: string}>}
 */
const loadProblemContent = async (questionId, { refresh = false } = {}) => {
  const question = await getQuestionOrThrow(questionId);

  if (!refresh) {
    const cached = await workspaceRepository.findProblemContent(question.id);
    if (cached) return { question, content: cached.content, modelName: cached.model_name };
  }

  if (!geminiProvider.isConfigured()) {
    return { question, content: null, modelName: null, error: 'Gemini API key is not configured, so problem statements and test cases cannot be generated.' };
  }

  // Avoid duplicate Gemini calls when several requests arrive at once
  if (!inflightGenerations.has(question.id)) {
    inflightGenerations.set(
      question.id,
      generateProblemContent(question).finally(() => inflightGenerations.delete(question.id))
    );
  }

  try {
    const { content, modelName } = await inflightGenerations.get(question.id);
    return { question, content, modelName };
  } catch (err) {
    logger.error(`Problem content generation failed for question=${question.id}: ${err.message}`);
    return { question, content: null, modelName: null, error: err.message };
  }
};

/**
 * Public problem payload: hidden test cases are counted but never sent to the client.
 */
const getProblem = async (questionId, options) => {
  const { content, modelName, error } = await loadProblemContent(questionId, options);

  if (!content) {
    return {
      generated: false,
      error: error || null,
      description: null,
      inputFormat: null,
      outputFormat: null,
      constraints: [],
      examples: [],
      sampleTests: [],
      hiddenTestCount: 0,
      starterCode: GENERIC_TEMPLATES,
      languages: listLanguages(),
    };
  }

  const sampleTests = content.testCases.filter((t) => !t.hidden).map(({ input, expectedOutput }) => ({ input, expectedOutput }));

  return {
    generated: true,
    modelName,
    description: content.description,
    inputFormat: content.inputFormat,
    outputFormat: content.outputFormat,
    constraints: content.constraints,
    examples: content.examples,
    sampleTests,
    hiddenTestCount: content.testCases.length - sampleTests.length,
    starterCode: { ...GENERIC_TEMPLATES, ...(content.starterCode || {}) },
    languages: listLanguages(),
  };
};

/**
 * Run code synchronously: against custom input, or against the visible sample tests.
 */
const runCode = async ({ questionId, language, sourceCode, customInput }) => {
  const lang = getLanguageOrThrow(language);

  let tests;
  let mode;
  if (typeof customInput === 'string') {
    mode = 'custom';
    tests = [{ input: customInput }];
  } else {
    const { content } = await loadProblemContent(questionId);
    tests = (content?.testCases || []).filter((t) => !t.hidden);
    mode = 'samples';
    if (!tests.length) {
      mode = 'custom';
      tests = [{ input: '' }];
    }
  }

  const results = await judge0Service.runBatch(
    tests.map((t) => ({ sourceCode, languageId: lang.judge0Id, stdin: t.input }))
  );
  const evaluation = evaluate(tests, results);
  delete evaluation.failures;

  return { mode, language: lang.key, ...evaluation };
};

/**
 * Queue a full submission (all test cases, including hidden ones).
 */
const submitCode = async ({ userId, questionId, language, sourceCode }) => {
  const lang = getLanguageOrThrow(language);
  await getQuestionOrThrow(questionId);

  const submission = await submissionsRepository.create({
    userId,
    questionId,
    sourceCode,
    languageId: lang.judge0Id,
    language: lang.key,
    stdin: null,
    expectedOutput: null,
    judge0Token: null,
  });

  const { submissionQueue } = require('../../queues/queues');
  await submissionQueue.add(
    `submission-suite-${submission.id}`,
    { mode: 'suite', submissionId: submission.id, userId, questionId, language: lang.key },
    { attempts: 2 }
  );

  logger.info(`Workspace submission queued: id=${submission.id} user=${userId} question=${questionId} lang=${lang.key}`);
  return { submissionId: submission.id, status: 'In Queue' };
};

/**
 * Worker entry point: execute a queued suite submission and record the verdict.
 */
const executeSuiteSubmission = async ({ submissionId, userId, questionId }) => {
  const submission = await submissionsRepository.findById(submissionId);
  if (!submission) throw new Error(`Submission ${submissionId} not found`);

  await submissionsRepository.update(submissionId, { statusId: 2, statusDescription: 'Processing' });

  const { content } = await loadProblemContent(questionId);
  let tests = content?.testCases || [];
  if (!tests.length) tests = [{ input: '', hidden: false }];

  const results = await judge0Service.runBatch(
    tests.map((t) => ({ sourceCode: submission.source_code, languageId: submission.language_id, stdin: t.input }))
  );
  const evaluation = evaluate(tests, results);

  await submissionsRepository.update(submissionId, {
    statusId: evaluation.statusId,
    statusDescription: evaluation.verdict,
    stdout: evaluation.cases.find((c) => !c.hidden)?.actualOutput ?? null,
    stderr: evaluation.stderr,
    compileOutput: evaluation.compileOutput,
    executionTime: evaluation.executionTime,
    executionMemory: evaluation.executionMemory,
    testResults: { cases: evaluation.cases, failures: evaluation.failures },
    passedCount: evaluation.passed,
    totalCount: evaluation.total,
  });

  if (evaluation.statusId === 3) {
    try {
      // Marks solved, advances recommendations and schedules spaced revision
      const questionsService = require('../questions/questions.service');
      await questionsService.markQuestionSolved(userId, questionId, null);
      const companyService = require('../company/company.service');
      await companyService.getCompanyReadiness(userId);
    } catch (err) {
      logger.error(`Post-acceptance updates failed for submission=${submissionId}: ${err.message}`);
    }
  }

  return evaluation;
};

/**
 * Execution summary of a user's submission, for AI analysis prompts.
 */
const getExecutionSummary = async (submissionId, userId) => {
  if (!submissionId) return null;
  const s = await submissionsRepository.findById(submissionId);
  if (!s) return null;
  if (s.user_id !== userId) throw new ForbiddenError('You are not authorized to use this submission');
  if (!s.total_count) return null;
  const testResults = typeof s.test_results === 'string' ? JSON.parse(s.test_results) : s.test_results;
  return {
    verdict: s.status_description,
    passed: s.passed_count,
    total: s.total_count,
    failures: testResults?.failures || [],
  };
};

module.exports = {
  listLanguages,
  getProblem,
  loadProblemContent,
  runCode,
  submitCode,
  executeSuiteSubmission,
  getExecutionSummary,
};
