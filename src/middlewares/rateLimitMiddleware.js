const { redis } = require('../config/redis');
const logger = require('../utils/logger');
const { AppError } = require('../errors/AppError');

/**
 * Fixed-window per-user rate limiter backed by Redis.
 * Lets requests through when Redis is unavailable, like cacheMiddleware.
 * @param {{ name: string, windowSeconds: number, max: number, message?: string }} options
 */
const rateLimit = ({ name, windowSeconds, max, message }) => async (req, res, next) => {
  if (redis.status !== 'ready') return next();

  const identity = req.user?.id ? `u:${req.user.id}` : `ip:${req.ip}`;
  const key = `ratelimit:${name}:${identity}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    if (count > max) {
      const ttl = await redis.ttl(key);
      res.setHeader('Retry-After', String(Math.max(ttl, 1)));
      return next(
        new AppError(message || 'Too many requests. Please wait a moment and try again.', 429, 'TOO_MANY_REQUESTS')
      );
    }
    return next();
  } catch (err) {
    logger.error(`[RateLimit] ${name}: ${err.message}`);
    return next();
  }
};

module.exports = rateLimit;
