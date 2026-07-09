/**
 * Centralized error handler — mount last in app.js.
 */
function errorHandler(err, req, res, next) {
  console.error('ERROR:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
    return res.status(400).json({
      success: false,
      error: { message: messages, code: 'VALIDATION_ERROR' },
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      success: false,
      error: { message: messages, code: 'VALIDATION_ERROR' },
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token', code: 'AUTH_ERROR' },
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || `ERR_${statusCode}`,
    },
  });
}

module.exports = errorHandler;
