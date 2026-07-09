const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { approveUserSchema, rejectUserSchema } = require('../validators/user.validator');

router.get('/pending-staff', authenticate, authorize('user:manage'), userController.getPendingStaff);
router.post('/:id/approve', authenticate, authorize('user:approve'), validate(approveUserSchema), userController.approveUser);
router.post('/:id/reject', authenticate, authorize('user:approve'), validate(rejectUserSchema), userController.rejectUser);

module.exports = router;
