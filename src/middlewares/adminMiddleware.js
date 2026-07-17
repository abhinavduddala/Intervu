const { ForbiddenError } = require('../errors/AppError');

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ForbiddenError('Access restricted to administrators only'));
  }
  next();
};

module.exports = adminMiddleware;
