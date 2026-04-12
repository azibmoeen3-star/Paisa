const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const {
  registerUser,
  loginUser,
  getUser,
  uploadUserAvatar,
  createDepositRequest,
  createWithdrawRequest,
  getUserTransactions,
  getUserDepositRequests,
  getUserWithdrawRequests,
  listPaymentProviders,
  buyPlan,
  getRunningPlans,
  getUserTeam
} = require('../controllers/user.controller');

const router = express.Router();
const receiptUploadPath = path.join(__dirname, '..', 'uploads', 'receipts');
const avatarUploadPath = path.join(__dirname, '..', 'uploads', 'avatars');
fs.mkdirSync(receiptUploadPath, { recursive: true });
fs.mkdirSync(avatarUploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: receiptUploadPath,
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

const avatarStorage = multer.diskStorage({
  destination: avatarUploadPath,
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });
const avatarUpload = multer({ storage: avatarStorage });

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/providers', listPaymentProviders);
router.get('/links', async (req, res) => {
  const { getLinks } = require('../services/whatsappLink.service');
  const links = await getLinks();
  res.json({ success: true, data: links });
});
router.get('/:id', getUser);
router.post('/:id/avatar', avatarUpload.single('avatar'), uploadUserAvatar);
router.post('/:id/deposit-request', upload.single('receipt'), createDepositRequest);
router.post('/:id/withdraw-request', createWithdrawRequest);
router.get('/:id/transactions', getUserTransactions);
router.get('/:id/deposits', getUserDepositRequests);
router.get('/:id/withdraws', getUserWithdrawRequests);
router.post('/:id/plans', buyPlan);
router.get('/:id/plans', getRunningPlans);
router.get('/:id/team', getUserTeam);

module.exports = router;
