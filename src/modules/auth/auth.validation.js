const { z } = require('zod');
const { ValidationError } = require('../../errors/AppError');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email address is required'),
    password: passwordSchema,
    role: z.enum(['admin', 'user']).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email address is required'),
    password: z.string().min(1, 'Password is required'),
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

  return next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
};
