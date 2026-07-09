const router = require('express').Router();
const citizenController = require('../controllers/citizen.controller');
const authenticate = require('../middlewares/authenticate');

// Mount all sub-routers under /api
router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/projects', require('./project.routes'));
router.use('/conflicts', require('./conflict.routes'));
router.use('/approvals', require('./approval.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/audit-logs', require('./audit.routes'));
router.use('/citizen', require('./citizen.routes'));

// Email/SMS log endpoint (mounted directly, accessed from notifications page)
router.get('/notifications/email-sms-log', authenticate, citizenController.getEmailSmsLog);

module.exports = router;
