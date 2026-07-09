const analyticsService = require('../services/analytics.service');

async function getCompletionRate(req, res, next) {
  try {
    const data = await analyticsService.getCompletionRate();
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getConflictTrend(req, res, next) {
  try {
    const data = await analyticsService.getConflictTrend();
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getDepartmentPerformance(req, res, next) {
  try {
    const data = await analyticsService.getDepartmentPerformance();
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getBudgetUtilization(req, res, next) {
  try {
    const data = await analyticsService.getBudgetUtilization();
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCompletionRate, getConflictTrend, getDepartmentPerformance, getBudgetUtilization };
