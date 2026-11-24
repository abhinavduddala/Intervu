const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const rateLimit = require('../../middlewares/rateLimitMiddleware');
const { validate } = require('../ai/ai.validation');
const controller = require('./interview.controller');
const { createSchema, listSchema, idSchema, answerSchema, endSchema } = require('./interview.validation');

const router = express.Router();
router.use(authMiddleware);

// AI-backed endpoints are rate limited per user
const createLimit = rateLimit({
  name: 'mock-interview-create',
  windowSeconds: 3600,
  max: 10,
  message: 'You have started too many interviews in the last hour. Please try again later.',
});
const turnLimit = rateLimit({
  name: 'mock-interview-turn',
  windowSeconds: 60,
  max: 20,
  message: 'You are sending answers too quickly. Please wait a moment.',
});
const evaluationLimit = rateLimit({ name: 'mock-interview-eval', windowSeconds: 3600, max: 10 });

// GET /api/v1/mock-interviews/options: setup form options
router.get('/options', controller.getOptions);
// GET /api/v1/mock-interviews/active: the user's running interview, if any
router.get('/active', controller.getActive);
// GET /api/v1/mock-interviews/stats: performance overview
router.get('/stats', controller.getStats);
// GET /api/v1/mock-interviews: history
router.get('/', validate(listSchema), controller.list);
// POST /api/v1/mock-interviews: create and start an interview
router.post('/', createLimit, validate(createSchema), controller.create);

// GET /api/v1/mock-interviews/:id: interview and transcript
router.get('/:id', validate(idSchema), controller.getById);
// GET /api/v1/mock-interviews/:id/status: progress and report status
router.get('/:id/status', validate(idSchema), controller.getStatus);
// POST /api/v1/mock-interviews/:id/answer: submit an answer, get the next interviewer message
router.post('/:id/answer', turnLimit, validate(answerSchema), controller.answer);
// POST /api/v1/mock-interviews/:id/pause and /resume
router.post('/:id/pause', validate(idSchema), controller.pause);
router.post('/:id/resume', validate(idSchema), controller.resume);
// POST /api/v1/mock-interviews/:id/end: end and queue the report
router.post('/:id/end', validate(endSchema), controller.end);
// POST /api/v1/mock-interviews/:id/evaluation/retry: re-queue a failed report
router.post('/:id/evaluation/retry', evaluationLimit, validate(idSchema), controller.retryEvaluation);
// GET /api/v1/mock-interviews/:id/report: final report
router.get('/:id/report', validate(idSchema), controller.getReport);
// DELETE /api/v1/mock-interviews/:id
router.delete('/:id', validate(idSchema), controller.remove);

module.exports = router;
