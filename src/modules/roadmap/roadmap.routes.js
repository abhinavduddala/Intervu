const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const roadmapController = require('./roadmap.controller');

const router = express.Router();

// Require user session for all routes
router.use(authMiddleware);

router.get('/', roadmapController.getRoadmap);

module.exports = router;
