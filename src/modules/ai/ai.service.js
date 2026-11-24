const logger = require('../../utils/logger');
const { NotFoundError, ForbiddenError } = require('../../errors/AppError');
const aiRepository = require('./ai.repository');
const aiPrompt = require('./ai.prompt');
const geminiProvider = require('./providers/gemini.provider');
const { hintResponseSchema } = require('./ai.schema');
const questionsRepository = require('../questions/questions.repository');

const parseResult = (raw) => {
  if (!raw) return null;
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Older rows stored raw provider errors; never show the provider name to users
const publicErrorMessage = (message) => {
  if (!message) return null;
  if (!/gemini|google/i.test(message)) return message;
  if (/high demand|overloaded|unavailable/i.test(message)) {
    return 'The AI service is busy right now. Please try again in a few minutes.';
  }
  return 'The AI review failed. Please try again.';
};

const formatAnalysis = (row) => {
  if (!row) return null;

  const result = parseResult(row.analysis_result);

  return {
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    submissionId: row.submission_id || null,
    language: row.language,
    submittedCode: row.submitted_code,
    status: row.status || 'completed',
    errorMessage: publicErrorMessage(row.error_message),
    createdAt: row.created_at,
    timestamp: row.created_at, // Compatibility tag for WorkspacePage history widget

    summary: result?.summary || null,
    correctness: result?.correctnessAssessment || null,
    strengths: result?.strengths || [],
    optimizations: result?.optimizations || [],
    conceptsUsed: result?.conceptsUsed || [],
    confidenceScore: result?.confidenceScore ?? null,
    optimalSolution: result?.optimalSolution || null,
    hints: result?.hints || [],

    // Legacy attributes kept for existing widgets
    timeComplexity: result?.timeComplexity?.value || 'Calculating...',
    spaceComplexity: result?.spaceComplexity?.value || 'Calculating...',
    time_complexity: result?.timeComplexity?.value || 'Calculating...',
    space_complexity: result?.spaceComplexity?.value || 'Calculating...',
    complexityExplanation: result
      ? `Time: ${result.timeComplexity?.value}. ${result.timeComplexity?.explanation || ''}\n\nSpace: ${result.spaceComplexity?.value}. ${result.spaceComplexity?.explanation || ''}`
      : 'Calculating complexity details...',
    optimizationSummary: result?.optimizations?.join('\n') || 'Generating optimizations...',
    edgeCases: result?.edgeCases || [],
    alternativeApproach: result?.alternativeApproach || null,
    interviewFeedback: {
      rating: result ? Math.round((result.confidenceScore ?? 0) / 10) : 0,
      assessment: result?.interviewFeedback || 'Calculating rating...',
    },
    analysisResult: result,
  };
};

/**
 * Queue an asynchronous Gemini code review (BullMQ `ai-analysis` worker).
 * @param {number|null} submissionId Optional judged submission, so the review uses real test results.
 */
const analyzePastedSolution = async (userId, questionId, { sourceCode, language, submissionId = null }) => {
  const question = await questionsRepository.findById(questionId);
  if (!question) {
    throw new NotFoundError('Target question not found in database');
  }

  if (submissionId) {
    // Validates ownership before the id is stored
    const workspaceService = require('../workspace/workspace.service');
    await workspaceService.getExecutionSummary(submissionId, userId);
  }

  const languageLabel = String(language).trim();

  const dbRecord = await aiRepository.create({
    userId,
    questionId,
    language: languageLabel,
    submittedCode: sourceCode,
    status: 'pending',
    submissionId: submissionId || null,
  });

  const { aiAnalysisQueue } = require('../../queues/queues');
  await aiAnalysisQueue.add(`ai-analysis-job-${dbRecord.id}`, {
    userId,
    questionId,
    sourceCode,
    language: languageLabel,
    analysisId: dbRecord.id,
    submissionId: submissionId || null,
  });

  logger.info(`AI analysis job logged and queued: id=${dbRecord.id}`);

  return {
    analysis: formatAnalysis(dbRecord),
  };
};

/**
 * Synchronous progressive hint (levels 1-3) from Gemini.
 */
const getHint = async (userId, { questionId, language, code, level, previousHints }) => {
  const question = await questionsRepository.findById(questionId);
  if (!question) {
    throw new NotFoundError('Target question not found in database');
  }

  const workspaceService = require('../workspace/workspace.service');
  const { content } = await workspaceService.loadProblemContent(questionId);

  const { systemPrompt, userPrompt } = aiPrompt.generateHintPrompt({
    question,
    problemDescription: content?.description,
    sourceCode: code,
    languageName: language,
    level,
    previousHints,
  });

  const { result } = await geminiProvider.generateStructured(systemPrompt, userPrompt, hintResponseSchema, {
    timeoutMs: 60000,
  });

  logger.info(`Hint level ${level} generated for user=${userId} question=${questionId}`);
  return { level, hint: result.hint, focus: result.focus };
};

const getAnalysisById = async (id, userId) => {
  const record = await aiRepository.findById(id);
  if (!record) {
    throw new NotFoundError('AI Code review analysis record not found');
  }

  if (record.user_id !== userId) {
    throw new ForbiddenError('You are not authorized to access this analysis review');
  }

  return formatAnalysis(record);
};

const getHistory = async (userId) => {
  const rows = await aiRepository.findByUserId(userId);
  return rows.map(formatAnalysis);
};

const getQuestionHistory = async (userId, questionId) => {
  const rows = await aiRepository.findByQuestionId(userId, questionId);
  return rows.map(formatAnalysis);
};

module.exports = {
  analyzePastedSolution,
  getHint,
  getAnalysisById,
  getHistory,
  getQuestionHistory,
};
