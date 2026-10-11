const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

router.use(authenticate, isAdmin);

// Dashboard KPIs
router.get('/dashboard', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.post('/users/:id/adjust-balance', adminController.adjustUserBalance);

// Transactions & Approvals
router.get('/transactions', adminController.getTransactions);
router.post('/transactions/:id/approve', adminController.approveTransaction);
router.post('/transactions/:id/reject', adminController.rejectTransaction);

// Game Control & Settings
router.get('/settings', adminController.getGameSettings);
router.post('/settings', adminController.updateGameSettings);
router.post('/emergency-crash', adminController.triggerEmergencyCrash);
router.post('/set-next-multiplier', adminController.setNextMultiplier);

module.exports = router;
