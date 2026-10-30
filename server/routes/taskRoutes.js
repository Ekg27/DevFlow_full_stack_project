/**
 * Task Routes
 *
 * Handles both project-scoped tasks (/api/projects/:projectId/tasks)
 * and direct task operations (/api/tasks/:taskId)
 */

const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/authorize');

// 1. Project-scoped tasks router: /api/projects/:projectId/tasks
const projectTaskRouter = express.Router({ mergeParams: true });
projectTaskRouter.use(authenticate);
projectTaskRouter.get('/', requireProjectMember, taskController.getProjectTasks);
projectTaskRouter.post('/', requireProjectMember, taskController.createTask);

// 2. Direct task router: /api/tasks
const taskRouter = express.Router();
taskRouter.use(authenticate);
taskRouter.get('/:taskId', taskController.getTask);
taskRouter.put('/:taskId', taskController.updateTask);
taskRouter.delete('/:taskId', taskController.deleteTask);

module.exports = {
  taskRouter,
  projectTaskRouter,
};
