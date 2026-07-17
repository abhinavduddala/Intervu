const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const adminMiddleware = require('../../middlewares/adminMiddleware');
const questionsController = require('./questions.controller');
const { validate, createPatternSchema } = require('./questions.validation');

const router = express.Router();

// GET /api/v1/patterns: Get existing patterns list (Authenticated users)
router.get('/', authMiddleware, questionsController.listPatterns);

// POST /api/v1/patterns: Create a new pattern (Admin only)
router.post('/', authMiddleware, adminMiddleware, validate(createPatternSchema), questionsController.createPattern);

module.exports = router;
