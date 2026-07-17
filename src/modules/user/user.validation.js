const { z } = require('zod');
const { ValidationError } = require('../../errors/AppError');

const preparationLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const difficultySchema = z.enum(['easy', 'medium', 'hard']);

const atLeastOneField = (fields) => (data, ctx) => {
  const hasField = fields.some((field) => data[field] !== undefined);
  if (!hasField) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `At least one of ${fields.join(', ')} must be provided`,
      path: [],
    });
  }
};

const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(1, 'Name cannot be empty').max(255).optional(),
      profilePicture: z.string().url('Profile picture must be a valid URL').nullable().optional(),
    })
    .superRefine(atLeastOneField(['name', 'profilePicture'])),
});

const updateTargetsSchema = z.object({
  body: z
    .object({
      targetCompanies: z
        .array(z.string().trim().min(1, 'Company name cannot be empty').max(100))
        .max(20, 'Cannot target more than 20 companies')
        .optional(),
      placementTimeline: z.string().trim().min(1).max(100).nullable().optional(),
      targetPreparationLevel: preparationLevelSchema.nullable().optional(),
    })
    .superRefine(atLeastOneField(['targetCompanies', 'placementTimeline', 'targetPreparationLevel'])),
});

const updatePreferencesSchema = z.object({
  body: z
    .object({
      preferredLanguage: z.string().trim().min(1).max(50).nullable().optional(),
      preferredDifficulty: difficultySchema.nullable().optional(),
      dashboardSettings: z.record(z.unknown()).optional(),
    })
    .superRefine(atLeastOneField(['preferredLanguage', 'preferredDifficulty', 'dashboardSettings'])),
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
  updateProfileSchema,
  updateTargetsSchema,
  updatePreferencesSchema,
};
