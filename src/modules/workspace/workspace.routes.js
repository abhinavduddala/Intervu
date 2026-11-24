const express = require('express');
const { z } = require('zod');
const authMiddleware = require('../../middlewares/authMiddleware');
const { validate } = require('../ai/ai.validation');
const workspaceService = require('./workspace.service');
const { LANGUAGE_KEYS } = require('./languages');

const router = express.Router();
router.use(authMiddleware);

const languageField = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => LANGUAGE_KEYS.includes(v), { message: `Language must be one of: ${LANGUAGE_KEYS.join(', ')}` });

const codeField = z
  .string()
  .min(1, 'Source code cannot be empty')
  .max(50000, 'Source code exceeds 50,000 characters');

const problemSchema = z.object({
  params: z.object({ questionId: z.coerce.number().int().positive() }),
  query: z.object({ refresh: z.enum(['true', 'false']).optional() }),
});

const runSchema = z.object({
  body: z.object({
    questionId: z.coerce.number().int().positive(),
    language: languageField,
    sourceCode: codeField,
    customInput: z.string().max(100000).optional(),
  }),
});

const submitSchema = z.object({
  body: z.object({
    questionId: z.coerce.number().int().positive(),
    language: languageField,
    sourceCode: codeField,
  }),
});

const wrap = (fn) => async (req, res, next) => {
  try {
    const data = await fn(req);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/workspace/languages: Supported languages
router.get('/languages', wrap(async () => ({ languages: workspaceService.listLanguages() })));

// GET /api/v1/workspace/questions/:questionId/problem: Statement, sample tests and starter code
router.get(
  '/questions/:questionId/problem',
  validate(problemSchema),
  wrap(async (req) => ({
    problem: await workspaceService.getProblem(req.params.questionId, { refresh: req.query.refresh === 'true' }),
  }))
);

// POST /api/v1/workspace/run: Run code against sample tests or custom input (synchronous)
router.post('/run', validate(runSchema), wrap(async (req) => ({ run: await workspaceService.runCode(req.body) })));

// POST /api/v1/workspace/submit: Queue a full judged submission (all tests, including hidden)
router.post(
  '/submit',
  validate(submitSchema),
  wrap(async (req) => workspaceService.submitCode({ userId: req.user.id, ...req.body }))
);

module.exports = router;
