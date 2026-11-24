const { Worker, UnrecoverableError } = require('bullmq');
const { redis } = require('../config/redis');
const logger = require('../utils/logger');
const { AppError } = require('../errors/AppError');
const aiRepository = require('../modules/ai/ai.repository');
const aiPrompt = require('../modules/ai/ai.prompt');
const geminiProvider = require('../modules/ai/providers/gemini.provider');
const questionsRepository = require('../modules/questions/questions.repository');
const questionsService = require('../modules/questions/questions.service');
const companyService = require('../modules/company/company.service');
const submissionsRepository = require('../modules/submissions/submissions.repository');
const judge0Service = require('../modules/submissions/judge0.service');
const workspaceService = require('../modules/workspace/workspace.service');

logger.info('🚀 Initializing background BullMQ workers...');

// Configuration and auth problems will not fix themselves on retry
const isRetryable = (err) => {
  if (!(err instanceof AppError)) return true;
  return err.statusCode === 429 || (err.statusCode >= 500 && err.statusCode !== 503);
};

const isFinalAttempt = (job, err) =>
  err instanceof UnrecoverableError || job.attemptsMade + 1 >= (job.opts.attempts || 1);

// 1. AI Analysis Worker
const aiWorker = new Worker(
  'ai-analysis',
  async (job) => {
    const { userId, questionId, sourceCode, language, analysisId, submissionId } = job.data;
    logger.info(`[Worker: AI] Processing job ${job.id} for analysisId ${analysisId}`);

    try {
      await aiRepository.updateStatus(analysisId, 'processing');

      const question = await questionsRepository.findById(questionId);
      if (!question) {
        throw new UnrecoverableError('Question not found');
      }

      // Real execution results and the problem statement make the review far more accurate
      const [execution, problem] = await Promise.all([
        workspaceService.getExecutionSummary(submissionId, userId).catch(() => null),
        workspaceService.loadProblemContent(questionId).catch(() => ({ content: null })),
      ]);

      const { systemPrompt, userPrompt } = aiPrompt.generateComplexityPrompt({
        questionTitle: question.title,
        questionTopic: question.topic_name,
        questionPattern: question.pattern_name,
        questionDifficulty: question.difficulty,
        questionHint: question.hint,
        problemDescription: problem?.content?.description,
        execution,
        sourceCode,
        languageName: language,
      });

      const { result, modelUsed } = await geminiProvider.getCodeReview(systemPrompt, userPrompt);

      await aiRepository.updateAnalysis(analysisId, {
        analysisResult: result,
        modelName: modelUsed,
        provider: 'gemini',
        status: 'completed',
      });

      // Count the question as solved when tests passed, or (without tests) when the review judges it correct
      const solved = execution ? execution.verdict === 'Accepted' : result?.correctnessAssessment?.status === 'likely_correct';
      if (solved) {
        try {
          await questionsService.markQuestionSolved(userId, questionId, null);
        } catch (err) {
          logger.error(`[Worker: AI] Failed to auto-mark question as solved: ${err.message}`);
        }
      }

      // Recalculate and cache company readiness (includes the new AI rating)
      try {
        await companyService.getCompanyReadiness(userId);
      } catch (err) {
        logger.error(`[Worker: AI] Failed to update company readiness: ${err.message}`);
      }

      logger.info(`[Worker: AI] Job ${job.id} completed successfully for analysisId ${analysisId}`);
      return { success: true };
    } catch (err) {
      const finalErr = err instanceof UnrecoverableError || isRetryable(err) ? err : new UnrecoverableError(err.message);
      logger.error(`[Worker: AI] Job ${job.id} attempt ${job.attemptsMade + 1} failed: ${err.message}`);
      if (isFinalAttempt(job, finalErr)) {
        await aiRepository.updateStatus(analysisId, 'failed', err.message);
      } else {
        await aiRepository.updateStatus(analysisId, 'pending', `Retrying: ${err.message}`);
      }
      throw finalErr;
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
      // Workspace submissions: run the full test-case suite
      if (job.data.mode === 'suite') {
        const evaluation = await workspaceService.executeSuiteSubmission(job.data);
        logger.info(`[Worker: Submissions] Suite ${submissionId}: ${evaluation.verdict} (${evaluation.passed}/${evaluation.total})`);
        return { success: true };
      }

      // Legacy single-run submissions
      const { token } = await judge0Service.submitCode({
        sourceCode,
        languageId,
        stdin,
        expectedOutput,
      });

      await submissionsRepository.updateToken(submissionId, token);

      const judge0Result = await judge0Service.pollSubmission(token);

      await submissionsRepository.update(submissionId, {
        statusId: judge0Result.statusId,
        statusDescription: judge0Result.statusDescription,
        stdout: judge0Result.stdout,
        stderr: judge0Result.stderr,
        compileOutput: judge0Result.compileOutput,
        executionTime: judge0Result.executionTime,
        executionMemory: judge0Result.executionMemory,
      });

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
      logger.error(`[Worker: Submissions] Job ${job.id} attempt ${job.attemptsMade + 1} failed: ${err.message}`);
      if (isFinalAttempt(job, err)) {
        await submissionsRepository.update(submissionId, {
          statusId: 13, // Internal Error
          statusDescription: `Execution failed: ${err.message}`.slice(0, 100),
        });
      }
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

// 3. Mock Interview Evaluation Worker
const mockInterviewService = require('../modules/mock-interview/interview.service');

const mockInterviewWorker = new Worker(
  'mock-interview-evaluation',
  async (job) => {
    const { interviewId } = job.data;
    logger.info(`[Worker: MockInterview] Evaluating interview ${interviewId} (job ${job.id})`);
    try {
      await mockInterviewService.runEvaluation(interviewId);
      return { success: true };
    } catch (err) {
      // An overloaded AI (503) is worth retrying here; a missing configuration is not
      const retryable = isRetryable(err) || (err.statusCode === 503 && geminiProvider.isConfigured());
      const finalErr = err instanceof UnrecoverableError || retryable ? err : new UnrecoverableError(err.message);
      logger.error(`[Worker: MockInterview] Job ${job.id} attempt ${job.attemptsMade + 1} failed: ${err.message}`);
      if (isFinalAttempt(job, finalErr)) {
        await mockInterviewService.markEvaluationFailed(interviewId, err);
      } else {
        await mockInterviewService.markEvaluationRetrying(interviewId, err);
      }
      throw finalErr;
    }
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

mockInterviewWorker.on('failed', (job, err) => {
  logger.error(`[Worker: MockInterview] Job ${job?.id} failed: ${err.message}`);
});

aiWorker.on('failed', (job, err) => {
  logger.error(`[Worker: AI] Job ${job?.id} failed: ${err.message}`);
});

submissionWorker.on('failed', (job, err) => {
  logger.error(`[Worker: Submissions] Job ${job?.id} failed: ${err.message}`);
});

module.exports = {
  aiWorker,
  submissionWorker,
  mockInterviewWorker,
};
