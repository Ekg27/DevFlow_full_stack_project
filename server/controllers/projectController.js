/**
 * Project Controller
 *
 * Handles project creation, listing, detail retrieval, updates, and deletion.
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLogger');
const { sanitize } = require('../middleware/validate');

/**
 * Get all projects that the current user belongs to
 * GET /api/projects
 */
function getProjects(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch projects with membership role, member count, and task statistics
    const stmt = db.prepare(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.start_date,
        p.deadline,
        p.created_by,
        p.created_at,
        pm.role,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Done') AS completed_tasks
      FROM projects p
      JOIN project_members pm ON p.id = pm.project_id
      WHERE pm.user_id = ?
      ORDER BY p.created_at DESC
    `);

    const projects = stmt.all(userId).map((p) => {
      const progress = p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0;
      return {
        ...p,
        progress_percentage: progress,
      };
    });

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new project
 * POST /api/projects
 */
function createProject(req, res, next) {
  try {
    const { name, description, start_date, deadline } = req.body;

    if (!name || String(name).trim() === '') {
      return res.status(400).json({
        error: true,
        message: 'Project name is required.',
      });
    }

    const cleanName = sanitize(name);
    const cleanDesc = description ? sanitize(description) : '';
    const userId = req.user.id;

    // Transaction to insert project AND add creator as Owner
    const createTx = db.transaction(() => {
      const insertProj = db.prepare(`
        INSERT INTO projects (name, description, start_date, deadline, created_by)
        VALUES (?, ?, ?, ?, ?)
      `);
      const projResult = insertProj.run(
        cleanName,
        cleanDesc,
        start_date || null,
        deadline || null,
        userId
      );
      const projectId = Number(projResult.lastInsertRowid);

      // Add creator as Owner in project_members
      const insertMember = db.prepare(`
        INSERT INTO project_members (project_id, user_id, role)
        VALUES (?, ?, 'Owner')
      `);
      insertMember.run(projectId, userId);

      // Record activity
      logActivity(projectId, userId, 'Created project', `Project "${cleanName}" was created`);

      return projectId;
    });

    const newProjectId = createTx();

    // Fetch the newly created project
    const newProject = db.prepare(`
      SELECT 
        p.*, 
        'Owner' as role,
        1 as member_count,
        0 as total_tasks,
        0 as completed_tasks,
        0 as progress_percentage
      FROM projects p 
      WHERE p.id = ?
    `).get(newProjectId);

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project: newProject,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single project details
 * GET /api/projects/:projectId
 */
function getProject(req, res, next) {
  try {
    const projectId = req.params.projectId;

    const project = db.prepare(`
      SELECT 
        p.*,
        u.name AS creator_name,
        u.email AS creator_email,
        (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) AS member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) AS total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'Done') AS completed_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'In Progress') AS in_progress_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'To Do') AS todo_tasks
      FROM projects p
      JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `).get(projectId);

    if (!project) {
      return res.status(404).json({
        error: true,
        message: 'Project not found.',
      });
    }

    const progress = project.total_tasks > 0 
      ? Math.round((project.completed_tasks / project.total_tasks) * 100) 
      : 0;

    return res.status(200).json({
      success: true,
      project: {
        ...project,
        user_role: req.memberRole, // Attached by requireProjectMember
        progress_percentage: progress,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update project details
 * PUT /api/projects/:projectId
 */
function updateProject(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const { name, description, start_date, deadline } = req.body;

    if (!name || String(name).trim() === '') {
      return res.status(400).json({
        error: true,
        message: 'Project name is required.',
      });
    }

    const cleanName = sanitize(name);
    const cleanDesc = description !== undefined ? sanitize(description) : '';

    const stmt = db.prepare(`
      UPDATE projects
      SET name = ?, description = ?, start_date = ?, deadline = ?
      WHERE id = ?
    `);

    stmt.run(cleanName, cleanDesc, start_date || null, deadline || null, projectId);

    logActivity(projectId, req.user.id, 'Updated project', `Updated details for project "${cleanName}"`);

    const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      project: updatedProject,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete project
 * DELETE /api/projects/:projectId
 */
function deleteProject(req, res, next) {
  try {
    const projectId = req.params.projectId;

    const project = db.prepare('SELECT name FROM projects WHERE id = ?').get(projectId);
    if (!project) {
      return res.status(404).json({ error: true, message: 'Project not found.' });
    }

    // Delete project (cascades to members, tasks, comments, activity_logs)
    db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);

    return res.status(200).json({
      success: true,
      message: `Project "${project.name}" has been deleted.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
};
