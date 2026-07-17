const express = require('express');
const authMiddleware = require('../../middlewares/authMiddleware');
const userController = require('./user.controller');
const {
  validate,
  updateProfileSchema,
  updateTargetsSchema,
  updatePreferencesSchema,
} = require('./user.validation');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

router.get('/targets', userController.getTargets);
router.put('/targets', validate(updateTargetsSchema), userController.updateTargets);

router.get('/preferences', userController.getPreferences);
router.put('/preferences', validate(updatePreferencesSchema), userController.updatePreferences);

module.exports = router;
