/**
 * Project Authorization Middleware
 *
 * Provides two functions that check if the authenticated user
 * is a member of the target project (and optionally has the
 * right role). These must run AFTER the auth middleware.
 */

const db = require('../config/db');

/**
 * requireProjectMember
 *
 * Verifies the current user belongs to the project specified
 * by req.params.projectId. Attaches the member's role to
 * req.memberRole so downstream handlers can use it.
 */
function requireProjectMember(req, res, next) {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      return res.status(400).json({ error: true, message: 'Project ID is required.' });
    }

    // Check the project exists
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);

    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found.' });
    }

    // Check membership
    const member = db
      .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
      .get(projectId, req.user.id);

    if (!member) {
      return res.status(403).json({
        error: true,
        message: 'You are not a member of this project.',
      });
    }

    // Attach role for downstream use
    req.memberRole = member.role;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * requireProjectRole(...roles)
 *
 * Higher-order middleware that first checks membership, then
 * verifies the member's role is one of the allowed roles.
 *
 * Usage: requireProjectRole('Owner', 'Admin')
 */
function requireProjectRole(...roles) {
  return (req, res, next) => {
    try {
      const projectId = req.params.projectId;

      if (!projectId) {
        return res.status(400).json({ error: true, message: 'Project ID is required.' });
      }

      // Check the project exists
      const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(projectId);

      if (!project) {
        return res.status(404).json({ error: true, message: 'Project not found.' });
      }

      // Check membership
      const member = db
        .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
        .get(projectId, req.user.id);

      if (!member) {
        return res.status(403).json({
          error: true,
          message: 'You are not a member of this project.',
        });
      }

      // Check role
      if (!roles.includes(member.role)) {
        return res.status(403).json({
          error: true,
          message: `This action requires one of the following roles: ${roles.join(', ')}.`,
        });
      }

      req.memberRole = member.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireProjectMember, requireProjectRole };
