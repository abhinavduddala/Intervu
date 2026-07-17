const { z } = require('zod');
const { ValidationError } = require('../../errors/AppError');

const questionIdParamSchema = z.object({
  params: z.object({
    questionId: z.coerce.number().int().positive('Question ID must be a positive integer'),
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
  questionIdParamSchema,
};
