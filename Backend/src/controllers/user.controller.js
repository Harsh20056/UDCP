const { User, AuditLog } = require('../models');

async function getPendingStaff(req, res, next) {
  try {
    const pending = await User.findAll({
      where: { status: 'PENDING_APPROVAL' },
      attributes: { exclude: ['password_hash'] },
    });
    // Match mock: returns flat array directly
    return res.json(pending.map(u => u.toJSON()));
  } catch (err) {
    next(err);
  }
}

async function approveUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'ACTIVE';
    await user.save();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'USER_APPROVED',
      target_type: 'user',
      target_id: user.id,
      details: `Approved staff account for ${user.name}`,
    });

    const safeUser = user.toJSON();
    delete safeUser.password_hash;
    return res.json(safeUser);
  } catch (err) {
    next(err);
  }
}

async function rejectUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = 'REJECTED';
    await user.save();

    await AuditLog.create({
      user_id: req.user.id,
      action: 'USER_REJECTED',
      target_type: 'user',
      target_id: user.id,
      details: `Rejected staff account for ${user.name}`,
    });

    const safeUser = user.toJSON();
    delete safeUser.password_hash;
    return res.json(safeUser);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPendingStaff, approveUser, rejectUser };
