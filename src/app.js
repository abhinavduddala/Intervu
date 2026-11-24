require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS matching client origins
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Logging request middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const questionsRoutes = require('./modules/questions/questions.routes');
const topicsRoutes = require('./modules/questions/topics.routes');
const patternsRoutes = require('./modules/questions/patterns.routes');
const submissionsRoutes = require('./modules/submissions/submissions.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const companyRoutes = require('./modules/company/company.routes');
const recommendationsRoutes = require('./modules/recommendations/recommendations.routes');
const revisionRoutes = require('./modules/revision/revision.routes');
const importRoutes = require('./modules/import/import.routes');
const roadmapRoutes = require('./modules/roadmap/roadmap.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/questions', questionsRoutes);
app.use('/api/v1/topics', topicsRoutes);
app.use('/api/v1/patterns', patternsRoutes);
app.use('/api/v1/submissions', submissionsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/revision', revisionRoutes);
app.use('/api/v1/admin/import', importRoutes);
app.use('/api/v1/roadmap', roadmapRoutes);
app.use('/api/v1/workspace', require('./modules/workspace/workspace.routes'));
app.use('/api/v1/mock-interviews', require('./modules/mock-interview/interview.routes'));

// Base Health Check endpoint
app.get('/health', async (req, res, next) => {
  try {
    const db = require('./config/db');
    await db.query('SELECT 1');
    res.status(200).json({
      success: true,
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// Fallback for undefined routes
app.all('*', (req, res, next) => {
  const err = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  err.statusCode = 404;
  err.code = 'ROUTE_NOT_FOUND';
  next(err);
});

// Global central error handler middleware
app.use(errorHandler);

module.exports = app;
