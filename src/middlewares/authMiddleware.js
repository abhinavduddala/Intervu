const jwt = require('jsonwebtoken');
const env = require('../config/env');
const authRepository = require('../modules/auth/auth.repository');
const { UnauthorizedError } = require('../errors/AppError');
const { TOKEN_COOKIE_NAME } = require('../modules/auth/auth.service');

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  if (req.cookies && req.cookies[TOKEN_COOKIE_NAME]) {
    return req.cookies[TOKEN_COOKIE_NAME];
  }

  return null;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const user = await authRepository.findById(decoded.sub);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authMiddleware;
