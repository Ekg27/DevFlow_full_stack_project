/**
 * Activity Controller
 *
 * Retrieves project activity audit logs with user attribution.
 */

const db = require('../config/db');

/**
 * Get activity history for a specific project
 * GET /api/projects/:projectId/activity
 */
function getProjectActivity(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const totalRow = db
      .prepare('SELECT COUNT(*) AS total FROM activity_logs WHERE project_id = ?')
      .get(projectId);
    const total = totalRow ? totalRow.total : 0;

    const activities = db
      .prepare(`
        SELECT 
          al.id,
          al.project_id,
          al.user_id,
          al.action,
          al.details,
          al.created_at,
          u.name AS user_name,
          u.email AS user_email
        FROM activity_logs al
        JOIN users u ON al.user_id = u.id
        WHERE al.project_id = ?
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
      `)
      .all(projectId, limit, offset);

    return res.status(200).json({
      success: true,
      total,
      limit,
      offset,
      activities,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectActivity,
};
