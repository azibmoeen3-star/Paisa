const WithdrawRequest = require('../models/withdrawRequest.model');
const User = require('../models/user.model');
const { createTransaction } = require('./transaction.service');

const createWithdrawRequest = async ({ userId, amount, accountDetails, paymentMethod, receiptUrl }) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (isNaN(amount) || amount <= 0) {
    const err = new Error('Withdraw amount must be a positive number');
    err.status = 400;
    throw err;
  }

  if (user.money < amount) {
    const err = new Error('Insufficient balance for withdrawal request');
    err.status = 400;
    throw err;
  }

  const withdraw = new WithdrawRequest({
    user: userId,
    amount,
    accountDetails,
    paymentMethod,
    receiptUrl
  });
  return withdraw.save();
};

const getWithdrawRequests = async (filter = {}) => {
  return WithdrawRequest.find(filter)
    .populate('user', 'username phone money referralsCount')
    .sort({ createdAt: -1 });
};

const getUserWithdrawRequests = async (userId) => {
  return WithdrawRequest.find({ user: userId }).sort({ createdAt: -1 });
};

const getWithdrawRequest = async (id) => {
  return WithdrawRequest.findById(id).populate('user', 'username phone money referralsCount');
};

const approveWithdrawRequest = async (withdrawId) => {
  const request = await WithdrawRequest.findById(withdrawId);
  if (!request) {
    const err = new Error('Withdraw request not found');
    err.status = 404;
    throw err;
  }
  if (request.status !== 'pending') {
    const err = new Error('Only pending requests can be approved');
    err.status = 400;
    throw err;
  }

  const user = await User.findById(request.user);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (user.money < request.amount) {
    const err = new Error('The user requesting withdrawal does not have sufficient balance');
    err.status = 400;
    throw err;
  }

  user.money -= request.amount;
  await user.save();

  request.status = 'approved';
  request.approvedAt = new Date();
  await request.save();

  await createTransaction({
    userId: user._id,
    type: 'withdraw',
    amount: request.amount,
    balanceAfter: user.money
  });

  return request;
};

const rejectWithdrawRequest = async (withdrawId) => {
  const request = await WithdrawRequest.findById(withdrawId);
  if (!request) {
    const err = new Error('Withdraw request not found');
    err.status = 404;
    throw err;
  }
  if (request.status !== 'pending') {
    const err = new Error('Only pending requests can be rejected');
    err.status = 400;
    throw err;
  }

  request.status = 'rejected';
  request.rejectedAt = new Date();
  await request.save();

  return request;
};

module.exports = {
  createWithdrawRequest,
  getWithdrawRequests,
  getUserWithdrawRequests,
  getWithdrawRequest,
  approveWithdrawRequest,
  rejectWithdrawRequest
};
