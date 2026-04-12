const User = require('../models/user.model');
const InvestmentPlan = require('../models/investmentPlan.model');
const UserPlan = require('../models/userPlan.model');
const { createTransaction } = require('./transaction.service');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const processMaturedPlans = async (userId) => {
  const filter = {
    payoutCredited: false,
    payoutAt: { $lte: new Date() }
  };
  if (userId) {
    filter.user = userId;
  }

  const maturedPlans = await UserPlan.find(filter);
  for (const userPlan of maturedPlans) {
    const user = await User.findById(userPlan.user);
    if (!user) continue;

    user.money += userPlan.daily;
    await user.save();

    userPlan.payoutCredited = true;
    userPlan.creditedAt = new Date();
    await userPlan.save();

    await createTransaction({
      userId: user._id,
      type: 'plan_payout',
      amount: userPlan.daily,
      balanceAfter: user.money
    });
  }
};

const buyPlan = async ({ userId, planId }) => {
  await processMaturedPlans(userId);

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const plan = await InvestmentPlan.findById(planId);
  if (!plan || !plan.isActive) {
    const err = new Error('Plan not found');
    err.status = 404;
    throw err;
  }

  // Removed check to allow multiple plans
  // const existingPlan = await UserPlan.findOne({ user: userId });
  // if (existingPlan) {
  //   const err = new Error('You already purchased a plan and cannot buy again');
  //   err.status = 400;
  //   throw err;
  // }

  if (user.money < plan.invest) {
    const err = new Error('Insufficient balance for this plan');
    err.status = 400;
    throw err;
  }

  user.money -= plan.invest;
  user.hasActivePlan = true;
  await user.save();

  const userPlan = await UserPlan.create({
    user: user._id,
    plan: plan._id,
    invest: plan.invest,
    daily: plan.daily,
    startedAt: new Date(),
    payoutAt: new Date(Date.now() + DAY_IN_MS)
  });

  await createTransaction({
    userId: user._id,
    type: 'plan_purchase',
    amount: plan.invest,
    balanceAfter: user.money
  });

  return userPlan;
};

const getRunningPlans = async (userId) => {
  await processMaturedPlans(userId);

  const plans = await UserPlan.find({ user: userId }).populate('plan').sort({ startedAt: -1 });
  const user = await User.findById(userId);
  if (user) {
    const hasAnyPlan = plans.length > 0;
    if (user.hasActivePlan !== hasAnyPlan) {
      user.hasActivePlan = hasAnyPlan;
      await user.save();
    }
  }
  return plans;
};

module.exports = {
  buyPlan,
  getRunningPlans,
  processMaturedPlans
};
