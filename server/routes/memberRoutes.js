/**
 * Project Member Routes
 *
 * Mounted at: /api/projects/:projectId/members
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const memberController = require('../controllers/memberController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectRole } = require('../middleware/authorize');

// Require authentication for all member routes
router.use(authenticate);

// View project members (any project member)
router.get('/', requireProjectMember, memberController.getMembers);

// Add project member (Owner or Admin only)
router.post('/', requireProjectRole('Owner', 'Admin'), memberController.addMember);

// Remove project member (Owner or Admin only)
router.delete('/:userId', requireProjectRole('Owner', 'Admin'), memberController.removeMember);

module.exports = router;
