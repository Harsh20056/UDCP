const router = require('express').Router();
const auditController = require('../controllers/audit.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/', authenticate, authorize('audit:view'), auditController.list);

module.exports = router;
