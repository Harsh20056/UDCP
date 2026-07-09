const bcrypt = require('bcrypt');
const { User, AuditLog } = require('../models');
const { signToken } = require('../utils/tokenUtils');
const { ACCOUNT_STATUS } = require('../config/constants');

/**
 * Register a new user.
 * Citizens → ACTIVE immediately. Staff → PENDING_APPROVAL.
 */
async function register(data) {
  const existing = await User.findOne({ where: { email: data.email } });
  if (existing) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(data.password, 10);
  const status = data.role === 'public_viewer' ? ACCOUNT_STATUS.ACTIVE : ACCOUNT_STATUS.PENDING_APPROVAL;

  const user = await User.create({
    name: data.name,
    email: data.email,
    password_hash,
    role: data.role,
    department: data.department || null,
    status,
    designation: data.designation || '',
    phone: data.phone || '',
  });

  const safeUser = user.toJSON();
  delete safeUser.password_hash;
  return { user: safeUser };
}

/**
 * Login — returns token + user for ACTIVE users.
 * Returns pending flag for PENDING_APPROVAL users instead of a token.
 */
async function login(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // Log the login attempt
  await AuditLog.create({
    user_id: user.id,
    action: 'USER_LOGIN',
    target_type: 'auth',
    details: `${user.name} logged in`,
  });

  const safeUser = user.toJSON();
  delete safeUser.password_hash;

  // If user is pending approval, let the frontend know
  if (user.status === ACCOUNT_STATUS.PENDING_APPROVAL) {
    return { token: null, user: safeUser, pendingApproval: true };
  }

  if (user.status === ACCOUNT_STATUS.REJECTED) {
    const err = new Error('Account has been rejected.');
    err.statusCode = 403;
    throw err;
  }

  const token = signToken({ userId: user.id, role: user.role, department: user.department });
  return { token, user: safeUser };
}

/**
 * Get current user from JWT payload.
 */
async function getMe(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user.toJSON();
}

module.exports = { register, login, getMe };
