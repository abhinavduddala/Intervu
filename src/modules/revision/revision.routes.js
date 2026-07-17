const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const revisionController = require('./revision.controller');
const { validate, questionIdParamSchema } = require('./revision.validation');

const router = express.Router();

// Require user session for all routes
router.use(authMiddleware);

// GET /api/v1/revision/today: Retrieve today's revisions
router.get('/today', revisionController.getTodayRevisions);

// GET /api/v1/revision/upcoming: Retrieve next 30 days of revisions
router.get('/upcoming', revisionController.getUpcomingRevisions);

// GET /api/v1/revision/dashboard: Retrieve dashboard statistics & calendar
router.get('/dashboard', revisionController.getDashboardStats);

// POST /api/v1/revision/:questionId/complete: Complete a revision and schedule the next
router.post('/:questionId/complete', validate(questionIdParamSchema), revisionController.completeRevision);

// POST /api/v1/revision/:questionId/reset: Reset schedule for a question
router.post('/:questionId/reset', validate(questionIdParamSchema), revisionController.resetRevision);

module.exports = router;
