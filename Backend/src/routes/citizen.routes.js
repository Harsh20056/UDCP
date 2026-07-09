const router = require('express').Router();
const citizenController = require('../controllers/citizen.controller');

// Public routes — no auth required
router.get('/projects', citizenController.getPublicProjects);
router.post('/feedback', citizenController.submitFeedback);

module.exports = router;
