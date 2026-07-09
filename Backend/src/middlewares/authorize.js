const { can } = require('../utils/permissions');

/**
 * RBAC authorization middleware — checks the permission matrix.
 * Usage: router.post('/projects', authenticate, authorize('project:create'), controller);
 */
function authorize(action) {
  return (req, res, next) => {
    if (!can(req.user, action, { department: req.body?.department, project: req.project })) {
      return res.status(403).json({ success: false, error: { message: 'Forbidden', code: 'FORBIDDEN' } });
    }
    next();
  };
}

module.exports = authorize;
