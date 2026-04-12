const User = require('../models/user.model');

const getUsers = async ({ search, page = 1, limit = 20 }) => {
  const filter = { role: 'user' };
  if (search) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ username: regex }, { phone: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('referredBy', 'username phone')
    .select('username phone money referralsCount referralIds referredBy avatarUrl createdAt');

  return {
    users,
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit))
  };
};

const updateAdminProfile = async (adminId, { phone, password }) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    const err = new Error('Admin not found');
    err.status = 404;
    throw err;
  }

  if (!phone && !password) {
    const err = new Error('Phone or password is required to update');
    err.status = 400;
    throw err;
  }

  if (phone) {
    const normalizedPhone = phone.trim();
    if (!/^[0-9]{11}$/.test(normalizedPhone)) {
      const err = new Error('Phone number must be exactly 11 digits');
      err.status = 400;
      throw err;
    }

    const existing = await User.findOne({ phone: normalizedPhone, _id: { $ne: adminId } });
    if (existing) {
      const err = new Error('Phone number already in use');
      err.status = 400;
      throw err;
    }

    admin.phone = normalizedPhone;
  }

  if (password) {
    admin.password = password;
  }

  await admin.save();
  return admin;
};

module.exports = {
  getUsers,
  updateAdminProfile
};
