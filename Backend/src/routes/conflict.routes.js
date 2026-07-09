const router = require('express').Router();
const conflictController = require('../controllers/conflict.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/', authenticate, conflictController.list);
router.get('/:id', authenticate, conflictController.getById);
router.post('/:id/resolve', authenticate, authorize('conflict:resolve'), conflictController.resolve);

module.exports = router;
