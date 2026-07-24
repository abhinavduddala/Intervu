const { redis } = require('../config/redis');
const logger = require('../utils/logger');

const cacheMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    if (redis.status !== 'ready') {
      logger.warn(`[Cache] Redis is not ready (status: ${redis.status}). Bypassing cache.`);
      return next();
    }

    const cacheKey = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await redis.get(cacheKey);
      if (cachedResponse) {
        logger.info(`[Cache] Hit: ${cacheKey}`);
        
        // Ensure content-type is set to application/json
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(cachedResponse);
      }

      logger.info(`[Cache] Miss: ${cacheKey}`);

      // Intercept res.json
      const originalJson = res.json;
      res.json = function (body) {
        // Only cache successful status codes
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (redis.status === 'ready') {
            redis.set(cacheKey, JSON.stringify(body), 'EX', ttl)
              .catch(err => logger.error(`[Cache] Failed to write key ${cacheKey}:`, err.message));
          } else {
            logger.warn(`[Cache] Redis is not ready (status: ${redis.status}). Skipping write.`);
          }
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (err) {
      logger.error(`[Cache] Error:`, err.message);
      next();
    }
  };
};

module.exports = cacheMiddleware;
