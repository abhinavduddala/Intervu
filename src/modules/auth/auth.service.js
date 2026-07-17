const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const logger = require('../../utils/logger');
const {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} = require('../../errors/AppError');
const authRepository = require('./auth.repository');

const BCRYPT_ROUNDS = 12;
const TOKEN_COOKIE_NAME = 'token';

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

const generateToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

const register = async ({ email, password, role = 'user' }) => {
  const existingUser = await authRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await authRepository.createUser({ email, passwordHash, role });
  const token = generateToken(user);

  logger.info(`User registered: ${user.email}`);

  return { user: sanitizeUser(user), token };
};

const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const token = generateToken(user);

  logger.info(`User logged in: ${user.email}`);

  return { user: sanitizeUser(user), token };
};

const getProfile = async (userId) => {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return sanitizeUser(user);
};

module.exports = {
  register,
  login,
  getProfile,
  generateToken,
  TOKEN_COOKIE_NAME,
};
