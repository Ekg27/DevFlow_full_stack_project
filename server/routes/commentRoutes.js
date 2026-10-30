/**
 * Comment Routes
 *
 * Handles task-scoped comments (/api/tasks/:taskId/comments)
 * and direct comment modifications (/api/comments/:commentId)
 */

const express = require('express');
const commentController = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

// 1. Task-scoped comments router: /api/tasks/:taskId/comments
const taskCommentRouter = express.Router({ mergeParams: true });
taskCommentRouter.use(authenticate);
taskCommentRouter.get('/', commentController.getTaskComments);
taskCommentRouter.post('/', commentController.addComment);

// 2. Direct comment router: /api/comments
const commentRouter = express.Router();
commentRouter.use(authenticate);
commentRouter.put('/:commentId', commentController.updateComment);
commentRouter.delete('/:commentId', commentController.deleteComment);

module.exports = {
  commentRouter,
  taskCommentRouter,
};
