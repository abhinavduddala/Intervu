const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const adminMiddleware = require('../../middlewares/adminMiddleware');
const questionsController = require('./questions.controller');
const { validate, createTopicSchema } = require('./questions.validation');

const router = express.Router();

// GET /api/v1/topics: Get existing topics list (Authenticated users)
router.get('/', authMiddleware, questionsController.listTopics);

// POST /api/v1/topics: Create a new topic (Admin only)
router.post('/', authMiddleware, adminMiddleware, validate(createTopicSchema), questionsController.createTopic);

module.exports = router;
