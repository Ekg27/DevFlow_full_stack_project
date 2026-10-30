/**
 * Project Activity Routes
 *
 * Mounted at: /api/projects/:projectId/activity
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember } = require('../middleware/authorize');

// Project activity routes require authentication and membership
router.use(authenticate);
router.get('/', requireProjectMember, activityController.getProjectActivity);

module.exports = router;
