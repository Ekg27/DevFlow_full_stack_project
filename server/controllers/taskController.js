/**
 * Task Controller
 *
 * Handles task creation, listing, retrieval, updates, status changes, and deletion.
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLogger');
const { sanitize } = require('../middleware/validate');

/**
 * Helper to verify that a user belongs to a project
 */
function verifyMembership(projectId, userId) {
  return db
    .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(projectId, userId);
}

/**
 * Get all tasks for a specific project
 * GET /api/projects/:projectId/tasks
 */
function getProjectTasks(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const { status, priority, assigned_to } = req.query;

    let query = `
      SELECT 
        t.*,
        u_assignee.name AS assignee_name,
        u_assignee.email AS assignee_email,
        u_creator.name AS creator_name,
        (SELECT COUNT(*) FROM comments WHERE task_id = t.id) AS comment_count
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
      JOIN users u_creator ON t.created_by = u_creator.id
      WHERE t.project_id = ?
    `;

    const params = [projectId];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }
    if (assigned_to) {
      query += ` AND t.assigned_to = ?`;
      params.push(assigned_to);
    }

    query += `
      ORDER BY 
        CASE t.priority 
          WHEN 'High' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Low' THEN 3 
          ELSE 4 
        END,
        t.created_at DESC
    `;

    const tasks = db.prepare(query).all(...params);

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a task in a project
 * POST /api/projects/:projectId/tasks
 */
function createTask(req, res, next) {
  try {
    const projectId = req.params.projectId;
    const { title, description, priority = 'Medium', status = 'To Do', assigned_to, due_date } = req.body;

    if (!title || String(title).trim() === '') {
      return res.status(400).json({
        error: true,
        message: 'Task title is required.',
      });
    }

    const cleanTitle = sanitize(title);
    const cleanDesc = description !== undefined ? sanitize(description) : '';

    const validPriorities = ['Low', 'Medium', 'High'];
    const validStatuses = ['To Do', 'In Progress', 'Done'];

    const taskPriority = validPriorities.includes(priority) ? priority : 'Medium';
    const taskStatus = validStatuses.includes(status) ? status : 'To Do';

    // If assigned_to is specified, verify that the assignee is a member of the project
    let assigneeId = null;
    if (assigned_to !== undefined && assigned_to !== null && String(assigned_to).trim() !== '') {
      const isMember = verifyMembership(projectId, assigned_to);
      if (!isMember) {
        return res.status(400).json({
          error: true,
          message: 'The assigned user must be an active member of this project.',
        });
      }
      assigneeId = Number(assigned_to);
    }

    const stmt = db.prepare(`
      INSERT INTO tasks (project_id, title, description, priority, status, assigned_to, created_by, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      projectId,
      cleanTitle,
      cleanDesc,
      taskPriority,
      taskStatus,
      assigneeId,
      req.user.id,
      due_date || null
    );

    const taskId = Number(result.lastInsertRowid);

    logActivity(
      projectId,
      req.user.id,
      'Created task',
      `Task "${cleanTitle}" was created (${taskPriority} priority)`
    );

    // Fetch the newly created task with assignee and creator names
    const newTask = db.prepare(`
      SELECT 
        t.*,
        u_assignee.name AS assignee_name,
        u_assignee.email AS assignee_email,
        u_creator.name AS creator_name,
        0 AS comment_count
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
      JOIN users u_creator ON t.created_by = u_creator.id
      WHERE t.id = ?
    `).get(taskId);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task: newTask,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single task by ID
 * GET /api/tasks/:taskId
 */
function getTask(req, res, next) {
  try {
    const taskId = req.params.taskId;

    const task = db.prepare(`
      SELECT 
        t.*,
        p.name AS project_name,
        u_assignee.name AS assignee_name,
        u_assignee.email AS assignee_email,
        u_creator.name AS creator_name,
        (SELECT COUNT(*) FROM comments WHERE task_id = t.id) AS comment_count
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
      JOIN users u_creator ON t.created_by = u_creator.id
      WHERE t.id = ?
    `).get(taskId);

    if (!task) {
      return res.status(404).json({
        error: true,
        message: 'Task not found.',
      });
    }

    // Verify current user belongs to the project
    const member = verifyMembership(task.project_id, req.user.id);
    if (!member) {
      return res.status(403).json({
        error: true,
        message: 'You are not a member of the project this task belongs to.',
      });
    }

    return res.status(200).json({
      success: true,
      task: {
        ...task,
        user_role: member.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update a task
 * PUT /api/tasks/:taskId
 */
function updateTask(req, res, next) {
  try {
    const taskId = req.params.taskId;

    // Look up existing task
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!existing) {
      return res.status(404).json({
        error: true,
        message: 'Task not found.',
      });
    }

    // Verify current user is a project member
    const member = verifyMembership(existing.project_id, req.user.id);
    if (!member) {
      return res.status(403).json({
        error: true,
        message: 'You are not authorized to update tasks in this project.',
      });
    }

    const {
      title,
      description,
      priority,
      status,
      assigned_to,
      due_date,
    } = req.body;

    const newTitle = title !== undefined ? sanitize(title) : existing.title;
    const newDesc = description !== undefined ? sanitize(description) : existing.description;

    const validPriorities = ['Low', 'Medium', 'High'];
    const validStatuses = ['To Do', 'In Progress', 'Done'];

    const newPriority = validPriorities.includes(priority) ? priority : existing.priority;
    const newStatus = validStatuses.includes(status) ? status : existing.status;
    const newDueDate = due_date !== undefined ? (due_date || null) : existing.due_date;

    let newAssignee = existing.assigned_to;
    if (assigned_to !== undefined) {
      if (assigned_to === null || String(assigned_to).trim() === '') {
        newAssignee = null;
      } else {
        const isMember = verifyMembership(existing.project_id, assigned_to);
        if (!isMember) {
          return res.status(400).json({
            error: true,
            message: 'The assigned user must be a member of this project.',
          });
        }
        newAssignee = Number(assigned_to);
      }
    }

    // Update task
    const updateStmt = db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, status = ?, assigned_to = ?, due_date = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    updateStmt.run(newTitle, newDesc, newPriority, newStatus, newAssignee, newDueDate, taskId);

    // Log status change if status changed
    if (newStatus !== existing.status) {
      logActivity(
        existing.project_id,
        req.user.id,
        'Updated task status',
        `Task "${newTitle}" moved to "${newStatus}"`
      );
    } else if (newAssignee !== existing.assigned_to) {
      let assigneeDesc = 'unassigned';
      if (newAssignee) {
        const assigneeUser = db.prepare('SELECT name FROM users WHERE id = ?').get(newAssignee);
        if (assigneeUser) assigneeDesc = `assigned to ${assigneeUser.name}`;
      }
      logActivity(
        existing.project_id,
        req.user.id,
        'Assigned task',
        `Task "${newTitle}" ${assigneeDesc}`
      );
    } else {
      logActivity(
        existing.project_id,
        req.user.id,
        'Updated task',
        `Task "${newTitle}" was updated`
      );
    }

    // Fetch updated task
    const updatedTask = db.prepare(`
      SELECT 
        t.*,
        u_assignee.name AS assignee_name,
        u_assignee.email AS assignee_email,
        u_creator.name AS creator_name,
        (SELECT COUNT(*) FROM comments WHERE task_id = t.id) AS comment_count
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assigned_to = u_assignee.id
      JOIN users u_creator ON t.created_by = u_creator.id
      WHERE t.id = ?
    `).get(taskId);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task: updatedTask,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a task
 * DELETE /api/tasks/:taskId
 */
function deleteTask(req, res, next) {
  try {
    const taskId = req.params.taskId;

    const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    if (!existing) {
      return res.status(404).json({
        error: true,
        message: 'Task not found.',
      });
    }

    const member = verifyMembership(existing.project_id, req.user.id);
    if (!member) {
      return res.status(403).json({
        error: true,
        message: 'You are not authorized to delete tasks in this project.',
      });
    }

    // Delete task (comments cascade)
    db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);

    logActivity(
      existing.project_id,
      req.user.id,
      'Deleted task',
      `Task "${existing.title}" was deleted`
    );

    return res.status(200).json({
      success: true,
      message: `Task "${existing.title}" was deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
};
