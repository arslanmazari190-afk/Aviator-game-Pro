const db = require('../db/db');

const adminController = {
  // 1. Dashboard Financial & Operational KPIs
  getDashboardStats: (req, res) => {
    try {
      const analytics = db.getAnalytics();
      const settings = db.getSettings();
      const recentTransactions = db.getAllTransactions(10);
      const recentRounds = db.getRecentRounds(10);

      return res.json({
        success: true,
        stats: {
          ...analytics,
          settings,
          recentTransactions,
          recentRounds
        }
      });
    } catch (err) {
      console.error('[ADMIN STATS ERROR]', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
    }
  },

  // 2. User Management
  getUsers: (req, res) => {
    try {
      const users = db.getAllUsers();
      return res.json({ success: true, users });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
  },

  updateUserStatus: (req, res) => {
    try {
      const { id } = req.params;
      const { is_frozen, kyc_status, role } = req.body;

      const user = db.findUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const updates = {};
      if (typeof is_frozen === 'boolean') updates.is_frozen = is_frozen;
      if (kyc_status) updates.kyc_status = kyc_status;
      if (role) updates.role = role;

      const updated = db.updateUser(id, updates);
      const { password_hash: _, ...safeUser } = updated;

      return res.json({
        success: true,
        message: `User ${user.username} profile updated successfully.`,
        user: safeUser
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update user.' });
    }
  },

  adjustUserBalance: (req, res) => {
    try {
      const { id } = req.params;
      const { amount, currency = 'PKR', reason } = req.body;

      const user = db.findUserById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount === 0) {
        return res.status(400).json({ success: false, message: 'Valid non-zero amount required.' });
      }

      db.adjustBalance(id, numAmount, currency);

      // Record transaction
      db.createTransaction({
        user_id: id,
        type: 'ADMIN_ADJUSTMENT',
        gateway: 'INTERNAL',
        currency: currency,
        amount: Math.abs(numAmount),
        status: 'APPROVED',
        account_title: 'Admin Adjustment',
        admin_notes: reason || `Manual Admin ${numAmount > 0 ? 'Credit' : 'Debit'}`
      });

      const updatedUser = db.findUserById(id);
      const { password_hash: _, ...safeUser } = updatedUser;

      return res.json({
        success: true,
        message: `Successfully adjusted balance by ${numAmount > 0 ? '+' : ''}${numAmount} ${currency}`,
        user: safeUser
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to adjust balance.' });
    }
  },

  // 3. Transactions & Approvals
  getTransactions: (req, res) => {
    try {
      const { type, status } = req.query;
      let txs = db.getAllTransactions(100);

      if (type) {
        txs = txs.filter(t => t.type === type);
      }
      if (status) {
        txs = txs.filter(t => t.status === status);
      }

      return res.json({ success: true, transactions: txs });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
    }
  },

  approveTransaction: (req, res) => {
    try {
      const { id } = req.params;
      const { admin_notes } = req.body;

      const tx = db.findTransactionById(id);
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Transaction not found.' });
      }

      if (tx.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: `Transaction is already ${tx.status}.` });
      }

      // If it's a pending deposit, credit the user balance
      if (tx.type === 'DEPOSIT') {
        db.adjustBalance(tx.user_id, tx.amount, tx.currency);
      }

      const updated = db.updateTransaction(id, {
        status: 'APPROVED',
        admin_notes: admin_notes || 'Approved by Admin Backoffice'
      });

      return res.json({
        success: true,
        message: `Transaction ${id} APPROVED successfully.`,
        transaction: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Approval failed.' });
    }
  },

  rejectTransaction: (req, res) => {
    try {
      const { id } = req.params;
      const { admin_notes } = req.body;

      const tx = db.findTransactionById(id);
      if (!tx) {
        return res.status(404).json({ success: false, message: 'Transaction not found.' });
      }

      if (tx.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: `Transaction is already ${tx.status}.` });
      }

      // If it's a withdrawal being rejected, refund the deducted balance back to user
      if (tx.type === 'WITHDRAW') {
        db.adjustBalance(tx.user_id, tx.amount, tx.currency);
      }

      const updated = db.updateTransaction(id, {
        status: 'REJECTED',
        admin_notes: admin_notes || 'Rejected by Admin Backoffice'
      });

      return res.json({
        success: true,
        message: `Transaction ${id} REJECTED. (If withdrawal, balance refunded to user)`,
        transaction: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Rejection failed.' });
    }
  },

  // 4. Game Control & Platform Settings
  getGameSettings: (req, res) => {
    try {
      const settings = db.getSettings();
      return res.json({ success: true, settings });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
    }
  },

  updateGameSettings: (req, res) => {
    try {
      const newSettings = req.body;
      const updated = db.updateSettings(newSettings);
      return res.json({
        success: true,
        message: 'Game & House settings updated successfully.',
        settings: updated
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update settings.' });
    }
  },

  // Emergency manual crash trigger
  triggerEmergencyCrash: (req, res) => {
    try {
      const gameEngine = req.app.get('gameEngine');
      if (!gameEngine) {
        return res.status(500).json({ success: false, message: 'Game engine unavailable.' });
      }

      if (gameEngine.state !== 'FLYING') {
        return res.status(400).json({ success: false, message: 'Game is not currently flying.' });
      }

      gameEngine.manualCrashOverride = true;
      return res.json({ success: true, message: 'Emergency crash initiated.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to trigger crash.' });
    }
  },

  // Set Next Round Target Multiplier (for test scenarios or demonstrations)
  setNextMultiplier: (req, res) => {
    try {
      const { multiplier } = req.body;
      const numMultiplier = Number(multiplier);

      if (!numMultiplier || numMultiplier < 1.00) {
        return res.status(400).json({ success: false, message: 'Multiplier must be at least 1.00x' });
      }

      const gameEngine = req.app.get('gameEngine');
      if (gameEngine) {
        gameEngine.nextMultiplierOverride = Number(numMultiplier.toFixed(2));
      }

      return res.json({
        success: true,
        message: `Next round crash point set to ${numMultiplier.toFixed(2)}x`
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to set multiplier.' });
    }
  }
};

module.exports = adminController;
