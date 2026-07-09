const { AuditLog } = require('../models');

/**
 * Middleware that auto-writes audit entries on mutating routes.
 * Captures before/after state for update operations.
 *
 * Usage: router.put('/projects/:id', authenticate, auditLogger('PROJECT_UPDATED', 'project'), controller);
 */
function auditLogger(action, resource) {
  return async (req, res, next) => {
    // Store the original json method to intercept the response
    const originalJson = res.json.bind(res);

    res.json = async function (body) {
      // Only log if the response was successful (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        try {
          await AuditLog.create({
            user_id: req.user.id,
            action,
            target_type: resource,
            target_id: req.params.id || req.params.projectId || null,
            before_state: req._beforeState || null,
            after_state: body?.data || body || null,
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = auditLogger;
