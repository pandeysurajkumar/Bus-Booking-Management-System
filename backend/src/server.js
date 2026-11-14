require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { releaseExpiredLocks } = require('./services/seatLockService');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

let server;
let lockCleanupInterval;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      logger.info(`Bus Booking Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      logger.info(`Swagger API Docs available at http://localhost:${PORT}/api/docs`);
    });

    // Background job: Periodically clean up expired seat locks every 60 seconds
    lockCleanupInterval = setInterval(async () => {
      try {
        await releaseExpiredLocks();
      } catch (err) {
        logger.error(`Error in periodic seat lock cleanup: ${err.message}`);
      }
    }, 60 * 1000);
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handling
const shutdown = () => {
  logger.info('Shutting down server gracefully...');
  if (lockCleanupInterval) clearInterval(lockCleanupInterval);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
