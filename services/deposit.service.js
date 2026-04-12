const DepositRequest = require('../models/depositRequest.model');
const User = require('../models/user.model');
const InvestmentPlan = require('../models/investmentPlan.model');
const UserPlan = require('../models/userPlan.model');
const { createTransaction } = require('./transaction.service');
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const createDepositRequest = async ({ userId, provider, amount, planId, transactionId, accountDetails, receiptUrl }) => {
  const deposit = new DepositRequest({
    user: userId,
    provider,
    amount,
    plan: planId || null,
    transactionId,
    accountDetails,
    receiptUrl
  });
  return deposit.save();
};

const getDepositRequests = async (filter = {}) => {
  return DepositRequest.find(filter)
    .populate('user', 'username phone money referralsCount')
    .populate('plan', 'invest daily')
    .sort({ createdAt: -1 });
};

const getUserDepositRequests = async (userId) => {
  return DepositRequest.find({ user: userId }).sort({ createdAt: -1 });
};

const approveDepositRequest = async (depositId) => {
  const request = await DepositRequest.findById(depositId);
  if (!request) {
    const err = new Error('Deposit request not found');
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

  user.money += request.amount;
  await user.save();

  request.status = 'approved';
  request.approvedAt = new Date();
  await request.save();

  if (request.plan) {
    const plan = await InvestmentPlan.findById(request.plan);
    if (plan && plan.isActive) {
      await UserPlan.create({
        user: user._id,
        plan: plan._id,
        invest: plan.invest,
        daily: plan.daily,
        startedAt: new Date(),
        payoutAt: new Date(Date.now() + DAY_IN_MS)
      });
      if (!user.hasActivePlan) {
        user.hasActivePlan = true;
        await user.save();
      }
    }
  }

  await createTransaction({
    userId: user._id,
    type: 'deposit',
    amount: request.amount,
    balanceAfter: user.money
  });

  return request;
};

module.exports = {
  createDepositRequest,
  getDepositRequests,
  getUserDepositRequests,
  approveDepositRequest
};
