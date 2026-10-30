/**
 * Activity Logger Service
 *
 * Centralized service to record important project actions
 * in the activity_logs table for auditing and tracking.
 */

const db = require('../config/db');

/**
 * Log an activity event in the database
 * @param {number|string} projectId - ID of the project
 * @param {number|string} userId - ID of the user performing the action
 * @param {string} action - Short title/type of action (e.g. 'Created project', 'Created task')
 * @param {string} [details=''] - Additional details or description of the action
 */
function logActivity(projectId, userId, action, details = '') {
  try {
    const stmt = db.prepare(`
      INSERT INTO activity_logs (project_id, user_id, action, details)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(projectId, userId, action, details);
  } catch (err) {
    // Activity logging should not fail the primary business operation
    console.error('⚠️ Failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
