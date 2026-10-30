/**
 * Project Members Controller
 *
 * Manages project team members: listing, adding, and removing members.
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLogger');
const { validateEmail } = require('../middleware/validate');

/**
 * Get all members of a project
 * GET /api/projects/:projectId/members
 */
function getMembers(req, res, next) {
  try {
    const projectId = req.params.projectId;

    const stmt = db.prepare(`
      SELECT 
        pm.id,
        pm.project_id,
        pm.user_id,
        pm.role,
        pm.joined_at,
        u.name,
        u.email
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ?
      ORDER BY 
        CASE pm.role 
          WHEN 'Owner' THEN 1 
          WHEN 'Admin' THEN 2 
          WHEN 'Member' THEN 3 
          ELSE 4 
        END,
        pm.joined_at ASC
    `);

    const members = stmt.all(projectId);

    return res.status(200).json({
      success: true,
      members,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add a member to a project by email
 * POST /api/projects/:projectId/members
 */
function addMember(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const { email, role = 'Member' } = req.body;

    if (!email || !validateEmail(String(email).trim().toLowerCase())) {
      return res.status(400).json({
        error: true,
        message: 'A valid user email address is required.',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const validRoles = ['Admin', 'Member'];
    const assignedRole = validRoles.includes(role) ? role : 'Member';

    // Find user by email
    const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(cleanEmail);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: `No user found with email "${cleanEmail}". User must register first.`,
      });
    }

    // Check if already a member
    const existing = db
      .prepare('SELECT id, role FROM project_members WHERE project_id = ? AND user_id = ?')
      .get(projectId, user.id);

    if (existing) {
      return res.status(409).json({
        error: true,
        message: `User is already a member of this project with role "${existing.role}".`,
      });
    }

    // Insert new member
    const insertStmt = db.prepare(`
      INSERT INTO project_members (project_id, user_id, role)
      VALUES (?, ?, ?)
    `);
    const result = insertStmt.run(projectId, user.id, assignedRole);

    logActivity(
      projectId,
      req.user.id,
      'Added member',
      `${user.name} was added as ${assignedRole}`
    );

    const newMember = {
      id: Number(result.lastInsertRowid),
      project_id: Number(projectId),
      user_id: user.id,
      name: user.name,
      email: user.email,
      role: assignedRole,
      joined_at: new Date().toISOString(),
    };

    return res.status(201).json({
      success: true,
      message: 'Member added to project successfully.',
      member: newMember,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove a member from a project
 * DELETE /api/projects/:projectId/members/:userId
 */
function removeMember(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;
    const currentUserRole = req.memberRole; // Provided by requireProjectRole

    // Check if target member exists
    const member = db
      .prepare(`
        SELECT pm.id, pm.role, u.name, u.email 
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = ? AND pm.user_id = ?
      `)
      .get(projectId, targetUserId);

    if (!member) {
      return res.status(404).json({
        error: true,
        message: 'Member not found in this project.',
      });
    }

    // Owner cannot be removed
    if (member.role === 'Owner') {
      return res.status(403).json({
        error: true,
        message: 'The project Owner cannot be removed from the project.',
      });
    }

    // Admins cannot remove other Admins (only Owners can remove Admins)
    if (currentUserRole === 'Admin' && member.role === 'Admin') {
      return res.status(403).json({
        error: true,
        message: 'Admins cannot remove other Admins. Only the Owner can perform this action.',
      });
    }

    // Perform removal in transaction (remove membership + set assigned tasks to NULL)
    const removeTx = db.transaction(() => {
      db.prepare('DELETE FROM project_members WHERE project_id = ? AND user_id = ?').run(
        projectId,
        targetUserId
      );

      // Unassign any tasks in this project currently assigned to this user
      db.prepare('UPDATE tasks SET assigned_to = NULL WHERE project_id = ? AND assigned_to = ?').run(
        projectId,
        targetUserId
      );

      logActivity(
        projectId,
        currentUserId,
        'Removed member',
        `${member.name} was removed from the project`
      );
    });

    removeTx();

    return res.status(200).json({
      success: true,
      message: `Member "${member.name}" removed successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMembers,
  addMember,
  removeMember,
};
