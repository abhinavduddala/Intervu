// Express Centralized Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // In development, log the full error stack trace for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error(`💥 Error [${errorCode}] at ${req.method} ${req.url}:`, err);
  } else {
    // In production, log a single-line summary
    console.error(`💥 Error [${errorCode}] at ${req.method} ${req.url}: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred.',
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
