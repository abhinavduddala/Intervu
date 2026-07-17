const express = require('express');
const importController = require('./import.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const adminMiddleware = require('../../middlewares/adminMiddleware');

const router = express.Router();

// POST /api/v1/admin/import/questions: Import questions from JSON (Admin only)
router.post('/questions', authMiddleware, adminMiddleware, importController.importQuestions);

module.exports = router;
