const db = require('../db/db');
const { PAYMENT_GATEWAYS } = require('../config/constants');

const walletController = {
  // Get current user wallet balance & stats
  getBalance: (req, res) => {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({
      success: true,
      balance_pkr: user.balance_pkr,
      balance_usdt: user.balance_usdt
    });
  },

  // Deposit Request
  deposit: (req, res) => {
    try {
      const user = db.findUserById(req.user.id);
      const { gateway, amount, currency = 'PKR', accountNumber, accountTitle, txHash } = req.body;
      const proofImage = req.file ? `/uploads/${req.file.filename}` : null;

      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid deposit amount.' });
      }

      if (!gateway || !Object.values(PAYMENT_GATEWAYS).includes(gateway)) {
        return res.status(400).json({ success: false, message: 'Invalid payment gateway selected.' });
      }

      // Auto-approved vs Manual review logic:
      // EasyPaisa / JazzCash / Instant Crypto can be auto-credited or set to instant confirmation for demonstration
      let isAutoApproved = false;
      let adminNote = 'Deposit requested';

      if (gateway === PAYMENT_GATEWAYS.EASYPAISA || gateway === PAYMENT_GATEWAYS.JAZZCASH) {
        // Simulated instant payment gateway confirmation (95% success rate simulation)
        isAutoApproved = true;
        adminNote = `Automated ${gateway} Merchant API Gateway instant clearance.`;
      } else if (gateway === PAYMENT_GATEWAYS.CRYPTO_USDT) {
        isAutoApproved = true;
        adminNote = 'TRC-20 Blockchain Webhook 12 confirmations verified.';
      } else if (gateway === PAYMENT_GATEWAYS.BANK_TRANSFER) {
        // Bank transfer with receipt uploaded waits for Admin approval
        isAutoApproved = false;
        adminNote = 'IBFT Bank receipt submitted. Pending Admin approval.';
      }

      const tx = db.createTransaction({
        user_id: user.id,
        type: 'DEPOSIT',
        gateway: gateway,
        currency: currency,
        amount: numAmount,
        status: isAutoApproved ? 'APPROVED' : 'PENDING',
        account_number: accountNumber || null,
        account_title: accountTitle || user.username,
        tx_hash: txHash || `TXN-${Date.now().toString(36).toUpperCase()}`,
        proof_image_url: proofImage,
        admin_notes: adminNote
      });

      if (isAutoApproved) {
        db.adjustBalance(user.id, numAmount, currency);
      }

      const updatedUser = db.findUserById(user.id);

      return res.status(201).json({
        success: true,
        message: isAutoApproved
          ? `Deposit of ${numAmount} ${currency} successfully credited to your wallet!`
          : `Deposit request of ${numAmount} ${currency} submitted! Admin will verify your receipt shortly.`,
        transaction: tx,
        newBalance: currency === 'PKR' ? updatedUser.balance_pkr : updatedUser.balance_usdt,
        autoApproved: isAutoApproved
      });
    } catch (err) {
      console.error('[WALLET DEPOSIT ERROR]', err);
      return res.status(500).json({ success: false, message: 'Deposit failed.' });
    }
  },

  // Withdrawal Request
  withdraw: (req, res) => {
    try {
      const user = db.findUserById(req.user.id);
      const { gateway, amount, currency = 'PKR', accountNumber, accountTitle } = req.body;

      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid withdrawal amount.' });
      }

      // Minimum withdrawal checks
      if (currency === 'PKR' && numAmount < 500) {
        return res.status(400).json({ success: false, message: 'Minimum withdrawal is PKR 500.' });
      }
      if (currency === 'USDT' && numAmount < 10) {
        return res.status(400).json({ success: false, message: 'Minimum withdrawal is 10 USDT.' });
      }

      if (!accountNumber) {
        return res.status(400).json({ success: false, message: 'Receiving account / wallet address is required.' });
      }

      const currentBalance = currency === 'PKR' ? user.balance_pkr : user.balance_usdt;
      if (currentBalance < numAmount) {
        return res.status(400).json({ success: false, message: `Insufficient ${currency} balance for withdrawal.` });
      }

      // Deduct balance immediately into escrow/pending
      db.adjustBalance(user.id, -numAmount, currency);

      const tx = db.createTransaction({
        user_id: user.id,
        type: 'WITHDRAW',
        gateway: gateway,
        currency: currency,
        amount: numAmount,
        status: 'PENDING',
        account_number: accountNumber,
        account_title: accountTitle || user.username,
        tx_hash: null,
        proof_image_url: null,
        admin_notes: 'Queued for financial team approval'
      });

      const updatedUser = db.findUserById(user.id);

      return res.status(201).json({
        success: true,
        message: `Withdrawal request for ${numAmount} ${currency} submitted. Funds will be sent to ${accountNumber} upon approval.`,
        transaction: tx,
        newBalance: currency === 'PKR' ? updatedUser.balance_pkr : updatedUser.balance_usdt
      });
    } catch (err) {
      console.error('[WALLET WITHDRAW ERROR]', err);
      return res.status(500).json({ success: false, message: 'Withdrawal failed.' });
    }
  },

  // User transaction history
  getTransactions: (req, res) => {
    try {
      const transactions = db.getUserTransactions(req.user.id);
      return res.json({ success: true, transactions });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
    }
  }
};

module.exports = walletController;
