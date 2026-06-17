const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`🚀 PrepPilot backend server listening on port ${PORT} in ${NODE_ENV} mode.`);
});

// Graceful process shutdown procedure
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Starting server graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed.');
    
    try {
      console.log('Closing database connection pool...');
      await db.pool.end();
      console.log('Database connection pool terminated successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Error occurred while closing database connection pool:', err);
      process.exit(1);
    }
  });

  // Force terminate after 10 seconds
  setTimeout(() => {
    console.error('Forced termination timeout reached. Exiting.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception occurred:', err);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Promise Rejection occurred:', reason);
  shutdown('UNHANDLED_REJECTION');
});
