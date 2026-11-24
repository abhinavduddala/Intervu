const { z } = require('zod');
const { LANGUAGE_KEYS } = require('../workspace/languages');
const profiles = require('./interview.profiles');

const idParams = z.object({ id: z.coerce.number().int().positive('Interview ID must be a positive integer') });

const createSchema = z.object({
  body: z
    .object({
      interviewType: z.enum(profiles.INTERVIEW_TYPE_KEYS),
      companyName: z.string().trim().max(100).optional().nullable(),
      jobRole: z.enum(profiles.JOB_ROLES),
      experienceLevel: z.enum(Object.keys(profiles.EXPERIENCE_LEVELS)),
      difficulty: z.enum(profiles.DIFFICULTIES).default('adaptive'),
      mode: z.enum(Object.keys(profiles.MODES)).default('realistic'),
      durationMinutes: z.coerce
        .number()
        .int()
        .refine((v) => profiles.DURATIONS.includes(v), { message: 'Duration must be 15, 30, 45 or 60 minutes' }),
      questionCount: z.coerce.number().int().min(3).max(20).optional().nullable(),
      programmingLanguage: z
        .string()
        .trim()
        .toLowerCase()
        .refine((v) => LANGUAGE_KEYS.includes(v), { message: `Language must be one of: ${LANGUAGE_KEYS.join(', ')}` })
        .optional()
        .nullable(),
      includeProjectQuestions: z.boolean().optional().default(false),
      candidateContext: z.string().max(6000, 'Background text is limited to 6,000 characters').optional().nullable(),
    })
    .strict(),
});

const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

const idSchema = z.object({ params: idParams });

const answerSchema = z.object({
  params: idParams,
  body: z.object({
    answer: z.string().trim().min(1, 'Answer cannot be empty').max(4000, 'Answers are limited to 4,000 characters'),
    clientMessageId: z.string().uuid('clientMessageId must be a UUID'),
    inputMode: z.enum(['text', 'voice']).optional(),
  }),
});

const endSchema = z.object({
  params: idParams,
  body: z.object({ reason: z.enum(['user_ended', 'time_up']).optional() }).optional().default({}),
});

module.exports = { createSchema, listSchema, idSchema, answerSchema, endSchema };
