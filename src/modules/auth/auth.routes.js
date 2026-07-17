const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/authMiddleware');
const {
  validate,
  registerSchema,
  loginSchema,
} = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
