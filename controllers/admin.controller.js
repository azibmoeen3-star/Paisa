const {
  getDepositRequests,
  approveDepositRequest
} = require('../services/deposit.service');
const {
  getWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
  getWithdrawRequest
} = require('../services/withdraw.service');
const { getUsers, updateAdminProfile } = require('../services/admin.service');
const {
  getProviders,
  updateProviderByName
} = require('../services/paymentProvider.service');
const { getLinks, updateLinkByKey } = require('../services/whatsappLink.service');

const listDepositRequests = async (req, res, next) => {
  try {
    const status = req.query.status || 'pending';
    const deposits = await getDepositRequests({ status });
    res.json({ success: true, data: deposits });
  } catch (err) {
    next(err);
  }
};

const approveDeposit = async (req, res, next) => {
  try {
    const deposit = await approveDepositRequest(req.params.id);
    res.json({ success: true, data: deposit });
  } catch (err) {
    next(err);
  }
};

const listWithdrawRequests = async (req, res, next) => {
  try {
    const status = req.query.status || 'pending';
    const withdraws = await getWithdrawRequests({ status });
    res.json({ success: true, data: withdraws });
  } catch (err) {
    next(err);
  }
};

const getWithdrawDetails = async (req, res, next) => {
  try {
    const withdraw = await getWithdrawRequest(req.params.id);
    if (!withdraw) {
      return res.status(404).json({ success: false, message: 'Withdraw request not found' });
    }
    res.json({ success: true, data: withdraw });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const users = await getUsers({ search, page, limit });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

const updateAdminProfileHandler = async (req, res, next) => {
  try {
    const admin = await updateAdminProfile(req.user._id, req.body);
    const { password, ...safeAdmin } = admin.toObject();
    res.json({ success: true, data: safeAdmin });
  } catch (err) {
    next(err);
  }
};

const approveWithdraw = async (req, res, next) => {
  try {
    const withdraw = await approveWithdrawRequest(req.params.id);
    res.json({ success: true, data: withdraw });
  } catch (err) {
    next(err);
  }
};

const rejectWithdraw = async (req, res, next) => {
  try {
    const withdraw = await rejectWithdrawRequest(req.params.id);
    res.json({ success: true, data: withdraw });
  } catch (err) {
    next(err);
  }
};

const listProviders = async (req, res, next) => {
  try {
    const providers = await getProviders();
    res.json({ success: true, data: providers });
  } catch (err) {
    next(err);
  }
};

const updateProviderHandler = async (req, res, next) => {
  try {
    const provider = await updateProviderByName(req.params.name, req.body);
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, data: provider });
  } catch (err) {
    next(err);
  }
};

const listLinks = async (req, res, next) => {
  try {
    const links = await getLinks();
    res.json({ success: true, data: links });
  } catch (err) {
    next(err);
  }
};

const updateLinkHandler = async (req, res, next) => {
  try {
    const link = await updateLinkByKey(req.params.key, req.body);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Link not found' });
    }
    res.json({ success: true, data: link });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  listDepositRequests,
  approveDeposit,
  listWithdrawRequests,
  getWithdrawDetails,
  approveWithdraw,
  rejectWithdraw,
  listProviders,
  updateProviderHandler,
  listLinks,
  updateLinkHandler,
  updateAdminProfileHandler
};

