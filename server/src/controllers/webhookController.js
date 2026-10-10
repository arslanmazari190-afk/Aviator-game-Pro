const db = require('../db/db');

const webhookController = {
  // EasyPaisa IPN Webhook
  easyPaisaWebhook: (req, res) => {
    try {
      console.log('[WEBHOOK] EasyPaisa Notification received:', req.body);
      const { transactionId, orderId, amount, status, signature } = req.body;

      // In production: verify RSA / HMAC signature against EasyPaisa Merchant Secret
      if (status === 'PAID' || status === 'SUCCESS' || status === '0000') {
        const tx = db.data.transactions.find(t => t.id === orderId || t.tx_hash === transactionId);
        if (tx && tx.status === 'PENDING') {
          db.adjustBalance(tx.user_id, Number(amount || tx.amount), tx.currency);
          db.updateTransaction(tx.id, {
            status: 'APPROVED',
            tx_hash: transactionId || tx.tx_hash,
            admin_notes: 'Confirmed via EasyPaisa IPN Webhook'
          });
        }
      }

      return res.json({ responseCode: '0000', responseDesc: 'SUCCESS' });
    } catch (err) {
      console.error('[EASYPAISA WEBHOOK ERROR]', err);
      return res.status(500).json({ responseCode: '9999', responseDesc: 'ERROR' });
    }
  },

  // JazzCash IPN Webhook
  jazzCashWebhook: (req, res) => {
    try {
      console.log('[WEBHOOK] JazzCash Notification received:', req.body);
      const { pp_TxnRefNo, pp_BillReference, pp_Amount, pp_ResponseCode } = req.body;

      if (pp_ResponseCode === '000' || pp_ResponseCode === '121') {
        const tx = db.data.transactions.find(t => t.id === pp_BillReference);
        if (tx && tx.status === 'PENDING') {
          const parsedAmount = Number(pp_Amount) / 100; // JazzCash amounts in paisas
          db.adjustBalance(tx.user_id, parsedAmount || tx.amount, tx.currency);
          db.updateTransaction(tx.id, {
            status: 'APPROVED',
            tx_hash: pp_TxnRefNo,
            admin_notes: 'Confirmed via JazzCash HTTP POST IPN'
          });
        }
      }

      return res.json({ pp_ResponseCode: '000', pp_ResponseMessage: 'Success' });
    } catch (err) {
      console.error('[JAZZCASH WEBHOOK ERROR]', err);
      return res.status(500).json({ pp_ResponseCode: '999', pp_ResponseMessage: 'Failure' });
    }
  },

  // Crypto / NOWPayments / Binance Pay Webhook
  cryptoWebhook: (req, res) => {
    try {
      console.log('[WEBHOOK] Crypto Blockchain Webhook received:', req.body);
      const { payment_id, payment_status, pay_amount, price_amount, actually_paid, customer_id } = req.body;

      if (payment_status === 'finished' || payment_status === 'confirmed' || payment_status === 'sending') {
        const tx = db.data.transactions.find(t => t.tx_hash === payment_id || t.id === customer_id);
        if (tx && tx.status === 'PENDING') {
          const creditAmount = actually_paid || pay_amount || price_amount || tx.amount;
          db.adjustBalance(tx.user_id, Number(creditAmount), 'USDT');
          db.updateTransaction(tx.id, {
            status: 'APPROVED',
            tx_hash: payment_id || tx.tx_hash,
            admin_notes: `Confirmed via Crypto Webhook (USDT TRC20)`
          });
        }
      }

      return res.json({ status: 'OK' });
    } catch (err) {
      console.error('[CRYPTO WEBHOOK ERROR]', err);
      return res.status(500).json({ status: 'ERROR' });
    }
  }
};

module.exports = webhookController;
