const fs = require('fs');
const User = require('../models/user.model');
const cloudinary = require('../config/cloudinary');
const { createTransaction } = require('./transaction.service');

const normalizeUsername = (username) => username?.trim().toLowerCase();
const ADMIN_DEFAULTS = {
  username: 'okadmin',
  phone: '03000000000',
  password: 'Admin@123',
  role: 'admin'
};
const TEST_USER_DEFAULTS = [
  {
    username: 'testuser1',
    phone: '03111111111',
    password: 'Test@123',
    role: 'user'
  },
  {
    username: 'testuser2',
    phone: '03222222222',
    password: 'Test@123',
    role: 'user'
  }
];

const createUser = async ({ username, phone, password, referredBy }) => {
  if (!username || !phone || !password) {
    const err = new Error('Username, phone, and password are required');
    err.status = 400;
    throw err;
  }

  const normalizedUsername = normalizeUsername(username);

  const existingUser = await User.findOne({
    $or: [{ username: normalizedUsername }, { phone }]
  });
  if (existingUser) {
    const err = new Error('Username or phone already exists');
    err.status = 400;
    throw err;
  }

  let referrer = null;
  if (referredBy) {
    const referredByNormalized = referredBy.trim();
    referrer = await User.findOne({
      $or: [{ username: normalizeUsername(referredByNormalized) }, { phone: referredByNormalized }]
    });
    if (!referrer) {
      const err = new Error('Referrer not found');
      err.status = 400;
      throw err;
    }
  }

  const user = new User({
    username: normalizedUsername,
    phone,
    password,
    referredBy: referrer ? referrer._id : null
  });

  const savedUser = await user.save();

  if (referrer) {
    referrer.referralsCount += 1;
    referrer.referralIds.push(savedUser._id);
    referrer.money += 70;
    await referrer.save();

    await createTransaction({
      userId: referrer._id,
      type: 'referral_bonus',
      amount: 70,
      balanceAfter: referrer.money
    });
  }

  return savedUser;
};

const loginUser = async ({ phone, password }) => {
  if (!phone || !password) {
    const err = new Error('Phone and password are required');
    err.status = 400;
    throw err;
  }

  const user = await User.findOne({ phone });
  if (!user || user.password !== password) {
    const err = new Error('Invalid phone or password');
    err.status = 400;
    throw err;
  }

  return user;
};

const getUserById = async (id) => {
  return User.findById(id).populate('referredBy', 'username phone');
};

const uploadUserAvatar = async (userId, filePath) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    folder: 'ok-users',
    use_filename: true,
    unique_filename: false,
    overwrite: true
  });

  user.avatarUrl = uploadResult.secure_url;
  await user.save();

  fs.unlink(filePath, (unlinkErr) => {
    if (unlinkErr) {
      console.error('Failed to delete temp avatar file:', unlinkErr);
    }
  });

  return user;
};

const ensureAdminUser = async () => {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    return existingAdmin;
  }

  const admin = await User.create({
    username: ADMIN_DEFAULTS.username,
    phone: ADMIN_DEFAULTS.phone,
    password: ADMIN_DEFAULTS.password,
    role: ADMIN_DEFAULTS.role
  });

  return admin;
};

const ensureTestUsers = async () => {
  const ensuredUsers = [];

  for (const testUser of TEST_USER_DEFAULTS) {
    let existing = await User.findOne({
      $or: [{ username: testUser.username }, { phone: testUser.phone }]
    });

    if (!existing) {
      existing = await User.create(testUser);
    }

    ensuredUsers.push(existing);
  }

  return ensuredUsers;
};

module.exports = {
  createUser,
  loginUser,
  getUserById,
  uploadUserAvatar,
  ensureAdminUser,
  ensureTestUsers,
  ADMIN_DEFAULTS,
  TEST_USER_DEFAULTS
};
