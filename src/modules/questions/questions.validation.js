const { z } = require('zod');
const { ValidationError } = require('../../errors/AppError');
const questionsRepository = require('./questions.repository');

const difficultySchema = z.enum(['easy', 'medium', 'hard']);

const optionalUrlSchema = z.string().url().nullable().optional();
const optionalNotesSchema = z.string().max(5000).nullable().optional();

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

const listQuestionsSchema = z.object({
  query: z.object({
    topic: z.string().trim().min(1).max(100).optional(),
    topicId: z.coerce.number().int().positive().optional(),
    pattern: z.string().trim().min(1).max(100).optional(),
    patternId: z.coerce.number().int().positive().optional(),
    difficulty: difficultySchema.optional(),
    search: z.string().trim().min(1).max(255).optional(),
    company: z.string().trim().min(1).max(100).optional(),
    frequency: z.string().trim().min(1).max(50).optional(),
    sortBy: z.enum(['learningOrder', 'difficulty', 'acceptanceRate', 'frequency', 'estimatedTime', 'title']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

const questionIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Question id must be a positive integer'),
  }),
});

const getQuestionBySlugSchema = z.object({
  params: z.object({
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  }),
});

const createQuestionSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title is required').max(255),
    topic: z.string().trim().min(1, 'Topic is required').max(100)
      .refine(async (name) => {
        const topic = await questionsRepository.findTopicByName(name);
        return !!topic;
      }, { message: 'Topic does not exist' }),
    pattern: z.string().trim().min(1, 'Pattern is required').max(100)
      .refine(async (name) => {
        const pattern = await questionsRepository.findPatternByName(name);
        return !!pattern;
      }, { message: 'Pattern does not exist' }),
    difficulty: difficultySchema,
    leetcodeUrl: optionalUrlSchema,
    videoSolutionUrl: optionalUrlSchema,
    notes: optionalNotesSchema,
  }),
});

const updateQuestionSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Question id must be a positive integer'),
  }),
  body: z
    .object({
      title: z.string().trim().min(1).max(255).optional(),
      topic: z.string().trim().min(1).max(100).optional()
        .refine(async (name) => {
          if (name === undefined) return true;
          const topic = await questionsRepository.findTopicByName(name);
          return !!topic;
        }, { message: 'Topic does not exist' }),
      pattern: z.string().trim().min(1).max(100).optional()
        .refine(async (name) => {
          if (name === undefined) return true;
          const pattern = await questionsRepository.findPatternByName(name);
          return !!pattern;
        }, { message: 'Pattern does not exist' }),
      difficulty: difficultySchema.optional(),
      leetcodeUrl: optionalUrlSchema,
      videoSolutionUrl: optionalUrlSchema,
      notes: optionalNotesSchema,
    })
    .superRefine(
      atLeastOneField([
        'title',
        'topic',
        'pattern',
        'difficulty',
        'leetcodeUrl',
        'videoSolutionUrl',
        'notes',
      ])
    ),
});

const createTopicSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Topic name is required').max(100),
  }),
});

const createPatternSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Pattern name is required').max(100),
  }),
});

const validate = (schema) => async (req, res, next) => {
  try {
    const result = await schema.safeParseAsync({
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

    if (result.data.query) {
      req.query = result.data.query;
    }
    if (result.data.body) {
      req.body = result.data.body;
    }
    if (result.data.params) {
      req.params = result.data.params;
    }

    return next();
  } catch (err) {
    next(err);
  }
};

const markSolvedSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Question id must be a positive integer'),
  }),
  body: z.object({
    leetcodeSubmissionUrl: z.string().url('A valid LeetCode submission URL is required').optional().nullable(),
  }),
});

const notesSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('Question id must be a positive integer'),
  }),
  body: z.object({
    notes: z.string().max(5000, 'Notes cannot exceed 5000 characters'),
  }),
});

module.exports = {
  validate,
  listQuestionsSchema,
  questionIdSchema,
  getQuestionBySlugSchema,
  createQuestionSchema,
  updateQuestionSchema,
  createTopicSchema,
  createPatternSchema,
  markSolvedSchema,
  notesSchema,
};
