const { verifyToken } = require('../utils/tokenUtils');
const { User } = require('../models');

/**
 * Verifies JWT from Authorization: Bearer header and attaches req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'NO_TOKEN' } });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: { message: 'Account not active', code: 'ACCOUNT_INACTIVE' } });
    }

    req.user = user.toJSON();
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: { message: 'Invalid token', code: 'INVALID_TOKEN' } });
  }
}

module.exports = authenticate;
