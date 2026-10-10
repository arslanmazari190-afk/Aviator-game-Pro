const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/easypaisa', webhookController.easyPaisaWebhook);
router.post('/jazzcash', webhookController.jazzCashWebhook);
router.post('/crypto', webhookController.cryptoWebhook);

module.exports = router;
