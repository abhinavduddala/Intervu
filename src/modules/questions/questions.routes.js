const express = require('express');
const questionsController = require('./questions.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const adminMiddleware = require('../../middlewares/adminMiddleware');
const {
  validate,
  listQuestionsSchema,
  questionIdSchema,
  getQuestionBySlugSchema,
  createQuestionSchema,
  updateQuestionSchema,
} = require('./questions.validation');

const cacheMiddleware = require('../../middlewares/cacheMiddleware');

const router = express.Router();

// Read operations: Available to any authenticated user
router.get('/', authMiddleware, validate(listQuestionsSchema), cacheMiddleware(3600), questionsController.listQuestions);
router.get('/topics', authMiddleware, cacheMiddleware(3600), questionsController.listTopics);
router.get('/patterns', authMiddleware, cacheMiddleware(3600), questionsController.listPatterns);
router.get('/companies', authMiddleware, cacheMiddleware(3600), questionsController.listCompanies);
router.get('/progress', authMiddleware, questionsController.getProgressList);
router.get('/slug/:slug', authMiddleware, validate(getQuestionBySlugSchema), cacheMiddleware(3600), questionsController.getQuestionBySlug);
router.get('/:id', authMiddleware, validate(questionIdSchema), cacheMiddleware(3600), questionsController.getQuestionById);

// Progress operations: Authenticated user operations
router.post('/:id/start', authMiddleware, validate(questionIdSchema), questionsController.startQuestion);
router.post('/:id/mark-solved', authMiddleware, validate(require('./questions.validation').markSolvedSchema), questionsController.markSolved);
router.post('/:id/favorite', authMiddleware, validate(questionIdSchema), questionsController.toggleFavorite);
router.post('/:id/notes', authMiddleware, validate(require('./questions.validation').notesSchema), questionsController.updateNotes);
router.post('/:id/paste-solution', authMiddleware, require('../ai/ai.validation').validate(require('../ai/ai.validation').pasteSolutionSchema), require('../ai/ai.controller').pasteSolution);

// Write operations: Restricted to admin users only
router.post('/', authMiddleware, adminMiddleware, validate(createQuestionSchema), questionsController.createQuestion);
router.put('/:id', authMiddleware, adminMiddleware, validate(updateQuestionSchema), questionsController.updateQuestion);
router.delete('/:id', authMiddleware, adminMiddleware, validate(questionIdSchema), questionsController.deleteQuestion);

module.exports = router;
