const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middlewares/authenticate');

router.get('/', authenticate, notificationController.list);
router.post('/:id/read', authenticate, notificationController.markRead);
router.get('/preferences', authenticate, notificationController.getPreferences);
router.put('/preferences', authenticate, notificationController.updatePreferences);

module.exports = router;
