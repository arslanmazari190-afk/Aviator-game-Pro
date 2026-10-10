const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/authMiddleware');
const { UPLOAD_DIR } = require('../config/constants');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage for deposit receipt screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get('/balance', authenticate, walletController.getBalance);
router.post('/deposit', authenticate, upload.single('receipt'), walletController.deposit);
router.post('/withdraw', authenticate, walletController.withdraw);
router.get('/transactions', authenticate, walletController.getTransactions);

module.exports = router;
