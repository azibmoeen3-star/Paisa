const fs = require('fs');
const {
  createUser,
  loginUser: loginUserService,
  getUserById,
  uploadUserAvatar: uploadUserAvatarService
} = require('../services/user.service');
const { createDepositRequest } = require('../services/deposit.service');
const { createWithdrawRequest } = require('../services/withdraw.service');
const { getTransactionsForUser } = require('../services/transaction.service');
const { getUserDepositRequests } = require('../services/deposit.service');
const { getUserWithdrawRequests } = require('../services/withdraw.service');
const { buyPlan, getRunningPlans } = require('../services/userPlan.service');
const User = require('../models/user.model');
const { getProviders } = require('../services/paymentProvider.service');
const cloudinary = require('../config/cloudinary');

const registerUser = async (req, res, next) => {
  try {
    const { username, phone, password, referredBy } = req.body;
    const user = await createUser({ username, phone, password, referredBy });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await loginUserService({ phone, password });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const createDepositRequestHandler = async (req, res, next) => {
  try {
    const { provider, amount, transactionId, accountDetails, planId } = req.body;
    let receiptUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'paisabazar-receipts',
        use_filename: true,
        unique_filename: false,
        overwrite: true
      });
      receiptUrl = uploadResult.secure_url;
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Failed to delete local receipt file:', unlinkErr);
        }
      });
    }

    if (!provider || !amount || !transactionId) {
      return res.status(400).json({ success: false, message: 'Provider, amount and transaction ID are required' });
    }

    const depositRequest = await createDepositRequest({
      userId: req.params.id,
      provider,
      amount: Number(amount),
      planId,
      transactionId,
      accountDetails,
      receiptUrl
    });

    res.status(201).json({ success: true, data: depositRequest });
  } catch (err) {
    next(err);
  }
};

const createWithdrawRequestHandler = async (req, res, next) => {
  try {
    const { amount, accountDetails, paymentMethod } = req.body;

    if (!amount || !accountDetails || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Withdraw amount, account details, and payment method are required'
      });
    }

    const withdrawRequest = await createWithdrawRequest({
      userId: req.params.id,
      amount: Number(amount),
      accountDetails,
      paymentMethod
    });

    res.status(201).json({ success: true, data: withdrawRequest });
  } catch (err) {
    next(err);
  }
};

const getUserTransactionsHandler = async (req, res, next) => {
  try {
    const transactions = await getTransactionsForUser(req.params.id);
    res.json({ success: true, data: transactions });
  } catch (err) {
    next(err);
  }
};

const getUserDepositRequestsHandler = async (req, res, next) => {
  try {
    const deposits = await getUserDepositRequests(req.params.id);
    res.json({ success: true, data: deposits });
  } catch (err) {
    next(err);
  }
};

const getUserWithdrawRequestsHandler = async (req, res, next) => {
  try {
    const withdraws = await getUserWithdrawRequests(req.params.id);
    res.json({ success: true, data: withdraws });
  } catch (err) {
    next(err);
  }
};

const uploadUserAvatarHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Avatar file is required' });
    }

    const user = await uploadUserAvatarService(req.params.id, req.file.path);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const listPaymentProviders = async (req, res, next) => {
  try {
    const providers = await getProviders();
    res.json({
      success: true,
      data: providers.map((provider) => ({
        _id: provider._id,
        provider: provider.name,
        name: provider.name,
        accountName: provider.accountName,
        accountNumber: provider.accountNumber,
        instructions: provider.instructions
      }))
    });
  } catch (err) {
    next(err);
  }
};

const buyPlanHandler = async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'planId is required' });
    }

    const userPlan = await buyPlan({ userId: req.params.id, planId });
    res.status(201).json({ success: true, data: userPlan });
  } catch (err) {
    next(err);
  }
};

const getRunningPlansHandler = async (req, res, next) => {
  try {
    const plans = await getRunningPlans(req.params.id);
    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

const getUserTeamHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('referralIds', 'username phone createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user.referralIds || [] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  uploadUserAvatar: uploadUserAvatarHandler,
  createDepositRequest: createDepositRequestHandler,
  createWithdrawRequest: createWithdrawRequestHandler,
  getUserTransactions: getUserTransactionsHandler,
  getUserDepositRequests: getUserDepositRequestsHandler,
  getUserWithdrawRequests: getUserWithdrawRequestsHandler,
  listPaymentProviders,
  buyPlan: buyPlanHandler,
  getRunningPlans: getRunningPlansHandler,
  getUserTeam: getUserTeamHandler
};
