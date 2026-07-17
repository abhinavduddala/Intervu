const express = require('express');
const submissionsController = require('./submissions.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const {
  validate,
  createSubmissionSchema,
  submissionIdSchema,
  listSubmissionsSchema,
} = require('./submissions.validation');

const router = express.Router();

// All routes require user authentication session
router.use(authMiddleware);

// POST /api/v1/submissions: Submit a new code execution
router.post('/', validate(createSubmissionSchema), submissionsController.createSubmission);

// GET /api/v1/submissions/history: Fetch past submissions list
router.get('/history', validate(listSubmissionsSchema), submissionsController.getSubmissionHistory);

// GET /api/v1/submissions/:id: Fetch specific submission metadata logs
router.get('/:id', validate(submissionIdSchema), submissionsController.getSubmissionById);

// GET /api/v1/submissions/:id/status: Check compile progress and update DB state
router.get('/:id/status', validate(submissionIdSchema), submissionsController.getSubmissionStatus);

module.exports = router;
