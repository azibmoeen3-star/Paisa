const User = require('../models/user.model');
const InvestmentPlan = require('../models/investmentPlan.model');
const UserPlan = require('../models/userPlan.model');
const { createTransaction } = require('./transaction.service');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const processMaturedPlans = async (userId) => {
  const filter = {
    payoutAt: { $lte: new Date() }
  };
  if (userId) {
    filter.user = userId;
  }

  const maturedPlans = await UserPlan.find(filter).select('_id user daily payoutAt');
  for (const userPlan of maturedPlans) {
    const now = Date.now();
    const originalPayoutAt = new Date(userPlan.payoutAt);
    const nextPayoutAtMs = originalPayoutAt.getTime();
    const cyclesDue = Math.floor((now - nextPayoutAtMs) / DAY_IN_MS) + 1;
    const payoutCycles = Math.max(1, cyclesDue);
    const totalPayout = Number(userPlan.daily) * payoutCycles;
    const updatedPayoutAt = new Date(nextPayoutAtMs + payoutCycles * DAY_IN_MS);

    // Prevent duplicate credits when multiple requests process payouts together.
    const claimedPlan = await UserPlan.findOneAndUpdate(
      { _id: userPlan._id, payoutAt: originalPayoutAt },
      {
        $set: {
          payoutAt: updatedPayoutAt,
          payoutCredited: true,
          creditedAt: new Date()
        }
      },
      { new: true }
    );
    if (!claimedPlan) continue;

    const updatedUser = await User.findByIdAndUpdate(
      userPlan.user,
      { $inc: { money: totalPayout } },
      { new: true }
    );
    if (!updatedUser) continue;

    await createTransaction({
      userId: updatedUser._id,
      type: 'plan_payout',
      amount: totalPayout,
      balanceAfter: updatedUser.money
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
