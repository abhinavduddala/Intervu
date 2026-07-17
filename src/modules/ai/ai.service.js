const logger = require('../../utils/logger');
const { NotFoundError, AppError, ForbiddenError } = require('../../errors/AppError');
const aiRepository = require('./ai.repository');
const aiPrompt = require('./ai.prompt');
const geminiProvider = require('./providers/gemini.provider');
const questionsRepository = require('../questions/questions.repository');

const formatAnalysis = (row) => {
  if (!row) return null;
  
  const result = typeof row.analysis_result === 'string' 
    ? (row.analysis_result ? JSON.parse(row.analysis_result) : null) 
    : row.analysis_result;
  
  return {
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    language: row.language,
    submittedCode: row.submitted_code,
    modelName: row.model_name,
    provider: row.provider,
    status: row.status || 'completed',
    createdAt: row.created_at,
    timestamp: row.created_at, // Compatibility tag for WorkspacePage history widget
    
    // Legacy attributes for frontend compat with AnalysisCard.jsx
    timeComplexity: result?.timeComplexity?.value || 'Calculating...',
    spaceComplexity: result?.spaceComplexity?.value || 'Calculating...',
    time_complexity: result?.timeComplexity?.value || 'Calculating...', // Compatibility tag for history widget
    space_complexity: result?.spaceComplexity?.value || 'Calculating...', // Compatibility tag for history widget
    complexityExplanation: result 
      ? `Time: ${result.timeComplexity.value}. ${result.timeComplexity.explanation}\n\nSpace: ${result.spaceComplexity.value}. ${result.spaceComplexity.explanation}`
      : 'Calculating complexity details...',
    optimizationSummary: result?.optimizations?.join('\n') || 'Generating optimizations...',
    edgeCases: result?.edgeCases || [],
    alternativeApproach: result?.alternativeApproach || null,
    interviewFeedback: {
      rating: result ? Math.round(result.confidenceScore / 10) : 0,
      assessment: result?.interviewFeedback || 'Calculating rating...',
    },
    // Raw nested structured output schema for storage / API inspection
    analysisResult: result,
  };
};

/**
 * Perform asynchronous BullMQ code analysis for a pasted solution.
 */
const analyzePastedSolution = async (userId, questionId, { sourceCode, language }) => {
  // 1. Retrieve and validate question context
  const question = await questionsRepository.findById(questionId);
  if (!question) {
    throw new NotFoundError('Target question not found in database');
  }

  // 2. Format language label
  const languageLabel = String(language).trim();

  // 3. Store pending code review structured result inside PostgreSQL
  const dbRecord = await aiRepository.create({
    userId,
    questionId,
    language: languageLabel,
    submittedCode: sourceCode,
    analysisResult: null,
    modelName: null,
    provider: null,
    status: 'pending',
  });

  // 4. Add job to BullMQ aiAnalysisQueue
  const { aiAnalysisQueue } = require('../../queues/queues');
  await aiAnalysisQueue.add(`ai-analysis-job-${dbRecord.id}`, {
    userId,
    questionId,
    sourceCode,
    language: languageLabel,
    analysisId: dbRecord.id,
  });

  logger.info(`AI analysis job logged and queued: id=${dbRecord.id}`);

  // 5. Return pending analysis metadata
  return {
    analysis: formatAnalysis(dbRecord)
  };
};

/**
 * Retrieve specific analysis details.
 */
const getAnalysisById = async (id, userId) => {
  const record = await aiRepository.findById(id);
  if (!record) {
    throw new NotFoundError('AI Code review analysis record not found');
  }

  // Access Control: Ensure user can only fetch their own reviews
  if (record.user_id !== userId) {
    throw new ForbiddenError('You are not authorized to access this analysis review');
  }

  return formatAnalysis(record);
};

/**
 * Retrieve all history records for a user.
 */
const getHistory = async (userId) => {
  const rows = await aiRepository.findByUserId(userId);
  return rows.map(formatAnalysis);
};

/**
 * Retrieve history records for a specific question for a user.
 */
const getQuestionHistory = async (userId, questionId) => {
  const rows = await aiRepository.findByQuestionId(userId, questionId);
  return rows.map(formatAnalysis);
};

module.exports = {
  analyzePastedSolution,
  getAnalysisById,
  getHistory,
  getQuestionHistory,
};
