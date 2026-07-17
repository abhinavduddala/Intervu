const { z } = require('zod');
const { ValidationError } = require('../../errors/AppError');

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

const analyzePastedSchema = z.object({
  body: z.object({
    questionId: z.coerce.number().int().positive('Question ID must be a positive integer'),
    language: z.string().trim().toLowerCase().refine(
      (val) => ['java', 'python', 'cpp', 'javascript', 'go', 'csharp'].includes(val),
      { message: 'Programming language must be one of: java, python, cpp, javascript, go, csharp' }
    ),
    code: z.string().trim()
      .min(1, 'Solution code cannot be empty')
      .max(50000, 'Code length exceeds maximum allowed review size (50,000 characters)'),
  }),
});

const questionIdParamSchema = z.object({
  params: z.object({
    questionId: z.coerce.number().int().positive('Question ID must be a positive integer'),
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Analysis ID must be a positive integer'),
  }),
});

module.exports = {
  validate,
  analyzePastedSchema,
  questionIdParamSchema,
  idParamSchema,
};
