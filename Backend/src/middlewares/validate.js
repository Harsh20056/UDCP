/**
 * Zod validation middleware factory.
 * Usage: router.post('/projects', validate(projectSchema), controller);
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Replace with cleaned data
      next();
    } catch (err) {
      if (err.errors) {
        const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({
          success: false,
          error: { message: messages, code: 'VALIDATION_ERROR' },
        });
      }
      return res.status(400).json({
        success: false,
        error: { message: err.message, code: 'VALIDATION_ERROR' },
      });
    }
  };
}

module.exports = validate;
