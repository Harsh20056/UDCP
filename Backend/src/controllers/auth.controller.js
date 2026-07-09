const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email and password are required.' } });
    }
    const result = await authService.login(email, password);
    // Match mock: returns { token, user } directly (not wrapped in { success, data })
    return res.json(result);
  } catch (err) {
    if (err.statusCode === 401) {
      return res.status(401).json({ message: err.message });
    }
    if (err.statusCode === 403) {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    // Simulated — always return success
    return res.json({ message: 'OTP sent to your registered email (simulated).' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    return res.json({ message: 'Password reset successful (simulated).' });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    // Match mock: returns user object directly (not wrapped)
    return res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, forgotPassword, resetPassword, getMe };
