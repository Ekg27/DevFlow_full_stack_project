/**
 * Project Routes
 *
 * /api/projects/*
 */

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectRole } = require('../middleware/authorize');

// All project routes require authentication
router.use(authenticate);

// Project collection routes
router.get('/', projectController.getProjects);
router.post('/', projectController.createProject);

// Single project routes with role-based checks
router.get('/:projectId', requireProjectMember, projectController.getProject);
router.put('/:projectId', requireProjectRole('Owner', 'Admin'), projectController.updateProject);
router.delete('/:projectId', requireProjectRole('Owner'), projectController.deleteProject);

module.exports = router;
