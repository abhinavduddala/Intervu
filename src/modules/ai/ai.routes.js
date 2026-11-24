const express = require('express');
const aiController = require('./ai.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const {
  validate,
  analyzePastedSchema,
  hintSchema,
  questionIdParamSchema,
  idParamSchema,
} = require('./ai.validation');

const router = express.Router();

// Require user session for all routes
router.use(authMiddleware);

// POST /api/v1/ai/analyze: Perform AI code analysis review and save to database
router.post('/analyze', validate(analyzePastedSchema), aiController.analyzeSolution);

// POST /api/v1/ai/hint: Progressive hint (level 1-3) for the current question and code
router.post('/hint', validate(hintSchema), aiController.getHint);

// GET /api/v1/ai/history: Retrieve list of code reviews done by the current user
router.get('/history', aiController.getUserHistory);

// GET /api/v1/ai/history/:id: Retrieve details of a specific code review analysis
router.get('/history/:id', validate(idParamSchema), aiController.getAnalysisDetails);

// GET /api/v1/ai/questions/:questionId/history: Retrieve review history for a specific question
router.get('/questions/:questionId/history', validate(questionIdParamSchema), aiController.getQuestionHistory);

module.exports = router;
