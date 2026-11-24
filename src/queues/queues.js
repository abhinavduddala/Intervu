const { Queue } = require('bullmq');
const { redis } = require('../config/redis');

const aiAnalysisQueue = new Queue('ai-analysis', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
});

const submissionQueue = new Queue('submissions', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
  },
});

const mockInterviewQueue = new Queue('mock-interview-evaluation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: true,
  },
});

module.exports = {
  aiAnalysisQueue,
  submissionQueue,
  mockInterviewQueue,
};
