const express = require('express');
const { requireAdmin } = require('../middleware/auth.middleware');
const {
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
} = require('../controllers/admin.controller');

const router = express.Router();

// Apply admin middleware to all admin routes
router.use(requireAdmin);

router.get('/users', listUsers);
router.get('/deposits', listDepositRequests);
router.post('/deposits/:id/approve', approveDeposit);
router.get('/withdraws', listWithdrawRequests);
router.get('/withdraw/:id', getWithdrawDetails);
router.post('/withdraws/:id/approve', approveWithdraw);
router.post('/withdraws/:id/reject', rejectWithdraw);
router.get('/providers', listProviders);
router.put('/providers/:name', updateProviderHandler);
router.get('/links', listLinks);
router.put('/links/:key', updateLinkHandler);
router.put('/profile', updateAdminProfileHandler);

module.exports = router;
