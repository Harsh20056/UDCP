const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/auth.validator');

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

router.get('/debug-users', async (req, res) => {
  try {
    const { User } = require('../models');
    const users = await User.findAll({ attributes: ['email'] });
    return res.json({ users: users.map(u => u.email) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
