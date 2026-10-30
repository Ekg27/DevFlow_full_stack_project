/**
 * Comment Controller
 *
 * Handles task comments: listing, adding, editing, and deleting comments.
 */

const db = require('../config/db');
const { logActivity } = require('../services/activityLogger');
const { sanitize } = require('../middleware/validate');

/**
 * Helper to get a task and verify user's membership in its project
 */
function getTaskAndVerifyMembership(taskId, userId) {
  const task = db.prepare('SELECT id, project_id, title FROM tasks WHERE id = ?').get(taskId);
  if (!task) {
    return { error: 'Task not found.', status: 404 };
  }

  const member = db
    .prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .get(task.project_id, userId);

  if (!member) {
    return {
      error: 'You are not a member of the project this task belongs to.',
      status: 403,
    };
  }

  return { task, member };
}

/**
 * Get all comments for a task
 * GET /api/tasks/:taskId/comments
 */
function getTaskComments(req, res, next) {
  try {
    const taskId = req.params.taskId;

    const check = getTaskAndVerifyMembership(taskId, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ error: true, message: check.error });
    }

    const comments = db
      .prepare(`
        SELECT 
          c.id,
          c.task_id,
          c.user_id,
          c.content,
          c.created_at,
          c.updated_at,
          u.name AS author_name,
          u.email AS author_email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at ASC
      `)
      .all(taskId);

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add a comment to a task
 * POST /api/tasks/:taskId/comments
 */
function addComment(req, res, next) {
  try {
    const taskId = req.params.taskId;
    const { content } = req.body;

    if (!content || String(content).trim() === '') {
      return res.status(400).json({
        error: true,
        message: 'Comment content cannot be empty.',
      });
    }

    const check = getTaskAndVerifyMembership(taskId, req.user.id);
    if (check.error) {
      return res.status(check.status).json({ error: true, message: check.error });
    }

    const cleanContent = sanitize(content);

    const insertStmt = db.prepare(`
      INSERT INTO comments (task_id, user_id, content)
      VALUES (?, ?, ?)
    `);
    const result = insertStmt.run(taskId, req.user.id, cleanContent);
    const commentId = Number(result.lastInsertRowid);

    // Record activity
    logActivity(
      check.task.project_id,
      req.user.id,
      'Added comment',
      `Commented on task "${check.task.title}"`
    );

    const newComment = db
      .prepare(`
        SELECT 
          c.id,
          c.task_id,
          c.user_id,
          c.content,
          c.created_at,
          c.updated_at,
          u.name AS author_name,
          u.email AS author_email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `)
      .get(commentId);

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      comment: newComment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing comment
 * PUT /api/comments/:commentId
 */
function updateComment(req, res, next) {
  try {
    const commentId = req.params.commentId;
    const { content } = req.body;

    if (!content || String(content).trim() === '') {
      return res.status(400).json({
        error: true,
        message: 'Comment content cannot be empty.',
      });
    }

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId);
    if (!comment) {
      return res.status(404).json({
        error: true,
        message: 'Comment not found.',
      });
    }

    // Only the author can edit their comment
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'You can only edit your own comments.',
      });
    }

    const cleanContent = sanitize(content);

    db.prepare(`
      UPDATE comments
      SET content = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(cleanContent, commentId);

    const updated = db
      .prepare(`
        SELECT 
          c.id,
          c.task_id,
          c.user_id,
          c.content,
          c.created_at,
          c.updated_at,
          u.name AS author_name,
          u.email AS author_email
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `)
      .get(commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully.',
      comment: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a comment
 * DELETE /api/comments/:commentId
 */
function deleteComment(req, res, next) {
  try {
    const commentId = req.params.commentId;

    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId);
    if (!comment) {
      return res.status(404).json({
        error: true,
        message: 'Comment not found.',
      });
    }

    // Only the author can delete their comment
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: 'You can only delete your own comments.',
      });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTaskComments,
  addComment,
  updateComment,
  deleteComment,
};
