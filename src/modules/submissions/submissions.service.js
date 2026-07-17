const logger = require('../../utils/logger');
const { NotFoundError } = require('../../errors/AppError');
const submissionsRepository = require('./submissions.repository');
const judge0Service = require('./judge0.service');
const questionsRepository = require('../questions/questions.repository');

const formatSubmission = (row) => ({
  id: row.id,
  userId: row.user_id,
  questionId: row.question_id,
  questionTitle: row.question_title,
  sourceCode: row.source_code,
  languageId: row.language_id,
  stdin: row.stdin,
  expectedOutput: row.expected_output,
  judge0Token: row.judge0_token,
  statusId: row.status_id,
  statusDescription: row.status_description,
  stdout: row.stdout,
  stderr: row.stderr,
  compileOutput: row.compile_output,
  executionTime: row.execution_time ? parseFloat(row.execution_time) : null,
  executionMemory: row.execution_memory,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const createSubmission = async ({
  userId,
  questionId,
  sourceCode,
  languageId,
  stdin,
  expectedOutput,
}) => {
  // 1. Verify question exists
  const question = await questionsRepository.findById(questionId);
  if (!question) {
    throw new NotFoundError(`Question with ID ${questionId} not found`);
  }

  logger.info(`Starting code execution for user=${userId} question=${questionId} lang=${languageId}`);

  // 2. Save pending submission in PostgreSQL with null token
  const submission = await submissionsRepository.create({
    userId,
    questionId,
    sourceCode,
    languageId,
    stdin,
    expectedOutput,
    judge0Token: null,
  });

  // 3. Add to BullMQ submissions queue
  const { submissionQueue } = require('../../queues/queues');
  await submissionQueue.add(`submission-job-${submission.id}`, {
    submissionId: submission.id,
    userId,
    questionId,
    sourceCode,
    languageId,
    stdin,
    expectedOutput,
  });

  logger.info(`Submission logged and queued: id=${submission.id}`);

  return formatSubmission(submission);
};

const getSubmissionDetails = async (id) => {
  const submission = await submissionsRepository.findById(id);
  if (!submission) {
    throw new NotFoundError('Submission not found');
  }
  return formatSubmission(submission);
};

const getSubmissionStatus = async (id) => {
  const submission = await submissionsRepository.findById(id);
  if (!submission) {
    throw new NotFoundError('Submission not found');
  }

  // The background worker polls Judge0 and updates PostgreSQL directly.
  // We simply read and return the latest state from the database.
  return formatSubmission(submission);
};

const getSubmissionHistory = async (userId, filters) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;

  const [submissions, total] = await Promise.all([
    submissionsRepository.findByUser(userId, { ...filters, page, limit }),
    submissionsRepository.countByUser(userId, filters),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    submissions: submissions.map(formatSubmission),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

module.exports = {
  createSubmission,
  getSubmissionDetails,
  getSubmissionStatus,
  getSubmissionHistory,
};
