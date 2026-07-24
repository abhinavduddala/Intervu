const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required by BullMQ
});

redis.on('connect', () => {
  logger.info('✔ Connected to Redis successfully.');
});

redis.on('error', (err) => {
  logger.error('💥 Redis connection error:', err.message);
});

// Helper to clear keys by pattern
const clearKeysByPattern = async (pattern) => {
  if (redis.status !== 'ready') {
    logger.warn(`[Cache] Redis is not ready (status: ${redis.status}). Skipping clearing keys for pattern: ${pattern}`);
    return;
  }
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Cleared ${keys.length} cached keys matching pattern: ${pattern}`);
    }
  } catch (err) {
    logger.error(`Failed to clear keys by pattern ${pattern}:`, err.message);
  }
};

module.exports = {
  redis,
  clearKeysByPattern,
};
