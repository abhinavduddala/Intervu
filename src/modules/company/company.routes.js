const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const companyController = require('./company.controller');

const router = express.Router();

// Require user session for all routes
router.use(authMiddleware);

// GET /api/v1/company/readiness: Retrieve readiness scores for all companies
router.get('/readiness', companyController.getReadiness);

// GET /api/v1/company/readiness/:company: Retrieve detailed readiness for a specific company
router.get('/readiness/:company', companyController.getReadinessDetail);

module.exports = router;
