/**
 * DevFlow Server Entry Point
 *
 * Initializes the SQLite database tables and starts the HTTP server.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { initDatabase } = require('./database/init');

// Initialize database schema and tables
try {
  initDatabase();
} catch (err) {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 DevFlow API server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

module.exports = server;
