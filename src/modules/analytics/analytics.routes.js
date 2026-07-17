const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const analyticsController = require('./analytics.controller');

const router = express.Router();

// Require user session for all routes
router.use(authMiddleware);

// GET /api/v1/analytics/dashboard: Retrieve dashboard statistics
router.get('/dashboard', analyticsController.getDashboard);

// GET /api/v1/analytics/topics: Retrieve completion percentages for all topics
router.get('/topics', analyticsController.getTopicsCompletion);

// GET /api/v1/analytics/patterns: Retrieve completion percentages for all patterns
router.get('/patterns', analyticsController.getPatternsCompletion);

module.exports = router;
