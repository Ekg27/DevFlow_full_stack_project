/**
 * Database Connection Configuration
 *
 * Uses better-sqlite3 for synchronous SQLite access.
 * Enables WAL mode for better concurrent read performance
 * and enforces foreign key constraints.
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database file lives in the server directory
const DB_PATH = path.join(__dirname, '..', 'devflow.db');

// Create or open the database
const db = new Database(DB_PATH);

// Enable Write-Ahead Logging for better performance
db.pragma('journal_mode = WAL');

// Enforce foreign key constraints (OFF by default in SQLite)
db.pragma('foreign_keys = ON');

module.exports = db;
