const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const recommendationsController = require('./recommendations.controller');

const router = express.Router();

// Require user session for all routes
router.use(authMiddleware);

// GET /api/v1/recommendations: Retrieve today's recommendations
router.get('/', recommendationsController.getRecommendations);

// GET /api/v1/recommendations/daily: Retrieve today's study plan
router.get('/daily', recommendationsController.getDailyStudyPlan);
router.get('/study-plan', recommendationsController.getDailyStudyPlan);

// GET /api/v1/recommendations/company/:company: Retrieve company-specific recommendations
router.get('/company/:company', recommendationsController.getCompanyRecommendations);

// POST /api/v1/recommendations/refresh: Force re-generate user study recommendations
router.post('/refresh', recommendationsController.refreshRecommendations);

module.exports = router;
