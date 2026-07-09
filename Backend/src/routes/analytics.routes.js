const router = require('express').Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middlewares/authenticate');

router.get('/completion-rate', authenticate, analyticsController.getCompletionRate);
router.get('/conflict-trend', authenticate, analyticsController.getConflictTrend);
router.get('/department-performance', authenticate, analyticsController.getDepartmentPerformance);
router.get('/budget-utilization', authenticate, analyticsController.getBudgetUtilization);

module.exports = router;
