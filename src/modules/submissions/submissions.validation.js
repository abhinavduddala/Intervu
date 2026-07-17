const { z } = require('zod');
const { ValidationError } = require('../../errors/AppError');

const createSubmissionSchema = z.object({
  body: z.object({
    questionId: z.coerce.number().int().positive('Question ID must be a positive integer'),
    sourceCode: z.string().min(1, 'Source code cannot be empty'),
    languageId: z.coerce.number().int().positive('Language ID must be a positive integer'),
    stdin: z.string().trim().optional(),
    expectedOutput: z.string().trim().optional(),
  }),
});

const submissionIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Submission ID must be a positive integer'),
  }),
});

const listSubmissionsSchema = z.object({
  query: z.object({
    questionId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.slice(1).join('.') || issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ValidationError('Validation failed', details));
  }

  if (result.data.query) req.query = result.data.query;
  if (result.data.body) req.body = result.data.body;
  if (result.data.params) req.params = result.data.params;

  return next();
};

module.exports = {
  validate,
  createSubmissionSchema,
  submissionIdSchema,
  listSubmissionsSchema,
};
