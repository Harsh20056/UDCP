const auditService = require('../services/audit.service');

async function list(req, res, next) {
  try {
    const result = await auditService.listAuditLogs(req.query);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
