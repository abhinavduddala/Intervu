const { Worker } = require('bullmq');
const { redis } = require('../config/redis');
const logger = require('../utils/logger');
const aiRepository = require('../modules/ai/ai.repository');
const aiPrompt = require('../modules/ai/ai.prompt');
const geminiProvider = require('../modules/ai/providers/gemini.provider');
const questionsRepository = require('../modules/questions/questions.repository');
const questionsService = require('../modules/questions/questions.service');
const companyService = require('../modules/company/company.service');
const submissionsRepository = require('../modules/submissions/submissions.repository');
const judge0Service = require('../modules/submissions/judge0.service');

logger.info('🚀 Initializing background BullMQ workers...');

// 1. AI Analysis Worker
const aiWorker = new Worker(
  'ai-analysis',
  async (job) => {
    const { userId, questionId, sourceCode, language, analysisId } = job.data;
    logger.info(`[Worker: AI] Processing job ${job.id} for analysisId ${analysisId}`);

    try {
      // Update status to processing
      await aiRepository.updateStatus(analysisId, 'processing');

      // Fetch question context
      const question = await questionsRepository.findById(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      // Generate prompt and call Gemini API
      const { systemPrompt, userPrompt } = aiPrompt.generateComplexityPrompt({
        questionTitle: question.title,
        questionTopic: question.topic_name,
        questionPattern: question.pattern_name,
        questionDifficulty: question.difficulty,
        questionHint: question.hint,
        sourceCode,
        languageName: language,
      });

      const { result, modelUsed } = await geminiProvider.getCodeReview(systemPrompt, userPrompt);

      // Save structured review to PostgreSQL and set completed
      await aiRepository.updateAnalysis(analysisId, {
        analysisResult: result,
        modelName: modelUsed,
        provider: 'gemini',
        status: 'completed',
      });

      // Auto-mark question as solved
      try {
        await questionsService.markQuestionSolved(userId, questionId, null);
      } catch (err) {
        logger.error(`[Worker: AI] Failed to auto-mark question as solved: ${err.message}`);
      }

      // Update company readiness
      try {
        await companyService.getCompanyReadiness(userId);
      } catch (err) {
        logger.error(`[Worker: AI] Failed to update company readiness: ${err.message}`);
      }

      logger.info(`[Worker: AI] Job ${job.id} completed successfully for analysisId ${analysisId}`);
      return { success: true };
    } catch (err) {
      logger.error(`[Worker: AI] Job ${job.id} failed: ${err.message}`);
      await aiRepository.updateStatus(analysisId, 'failed');
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

// 2. Submission Worker
const submissionWorker = new Worker(
  'submissions',
  async (job) => {
    const { submissionId, userId, questionId, sourceCode, languageId, stdin, expectedOutput } = job.data;
    logger.info(`[Worker: Submissions] Processing job ${job.id} for submissionId ${submissionId}`);

    try {
      // Submit code to Judge0
      const { token } = await judge0Service.submitCode({
        sourceCode,
        languageId,
        stdin,
        expectedOutput,
      });

      // Update database with judge0 token
      await submissionsRepository.updateToken(submissionId, token);

      // Poll Judge0 for result
      const judge0Result = await judge0Service.pollSubmission(token);

      // Save final execution results
      await submissionsRepository.update(submissionId, {
        statusId: judge0Result.statusId,
        statusDescription: judge0Result.statusDescription,
        stdout: judge0Result.stdout,
        stderr: judge0Result.stderr,
        compileOutput: judge0Result.compileOutput,
        executionTime: judge0Result.executionTime,
        executionMemory: judge0Result.executionMemory,
      });

      // Trigger revision check if statusId = 3 (Accepted)
      if (judge0Result.statusId === 3) {
        try {
          const revisionService = require('../modules/revision/revision.service');
          await revisionService.triggerRevisionCheck(userId, questionId);
        } catch (err) {
          logger.error(`[Worker: Submissions] Failed to trigger revision check: ${err.message}`);
        }
      }

      logger.info(`[Worker: Submissions] Job ${job.id} completed successfully for submissionId ${submissionId}`);
      return { success: true };
    } catch (err) {
      logger.error(`[Worker: Submissions] Job ${job.id} failed: ${err.message}`);
      // Update status to failed
      await submissionsRepository.update(submissionId, {
        statusId: 4, // Fatal Error
        statusDescription: `Worker execution failed: ${err.message}`,
      });
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

aiWorker.on('failed', (job, err) => {
  logger.error(`[Worker: AI] Job ${job?.id} failed globally:`, err);
});

submissionWorker.on('failed', (job, err) => {
  logger.error(`[Worker: Submissions] Job ${job?.id} failed globally:`, err);
});

module.exports = {
  aiWorker,
  submissionWorker,
};
