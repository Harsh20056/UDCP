const router = require('express').Router();
const approvalController = require('../controllers/approval.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { approveSchema, rejectSchema } = require('../validators/approval.validator');

router.get('/', authenticate, authorize('approval:view'), approvalController.list);
router.post('/:projectId/approve', authenticate, authorize('approval:approve'), validate(approveSchema), approvalController.approve);
router.post('/:projectId/reject', authenticate, authorize('approval:reject'), validate(rejectSchema), approvalController.reject);
router.get('/:projectId/history', authenticate, approvalController.getHistory);

module.exports = router;
