const db = require('../db/db');
const ProvablyFair = require('../engine/ProvablyFair');

const gameController = {
  // Get recent completed game rounds for multiplier ribbon
  getRecentRounds: (req, res) => {
    try {
      const rounds = db.getRecentRounds(40);
      return res.json({ success: true, rounds });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch rounds.' });
    }
  },

  // Get specific round Provably Fair details
  getRoundDetails: (req, res) => {
    try {
      const { id } = req.params;
      const round = db.findRoundById(id);
      if (!round) {
        return res.status(404).json({ success: false, message: 'Round not found.' });
      }
      return res.json({ success: true, round });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch round details.' });
    }
  },

  // Independent Provably Fair Verifier
  verifyGameHash: (req, res) => {
    try {
      const { serverSeed, clientSeed, nonce } = req.body;

      if (!serverSeed || !clientSeed || nonce === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Server Seed, Client Seed, and Nonce are all required for verification.'
        });
      }

      const settings = db.getSettings();
      const verification = ProvablyFair.verifyRound(
        serverSeed.trim(),
        clientSeed.trim(),
        Number(nonce),
        settings.houseEdge
      );

      return res.json({
        success: true,
        verification
      });
    } catch (err) {
      console.error('[PROVABLY FAIR VERIFY ERROR]', err);
      return res.status(500).json({ success: false, message: 'Calculation error.' });
    }
  },

  // Get user's personal bets
  getMyBets: (req, res) => {
    try {
      const bets = db.getUserBets(req.user.id, 50);
      return res.json({ success: true, bets });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch bets.' });
    }
  },

  // Get Top Wins leaderboard
  getTopWins: (req, res) => {
    try {
      const topWins = db.getTopWins(30);
      return res.json({ success: true, topWins });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch top wins.' });
    }
  },

  // Post chat message
  postChatMessage: (req, res) => {
    try {
      const { message, emoji } = req.body;
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
      }

      const user = req.user;
      const chatMsg = db.addChatMessage({
        user_id: user.id,
        username: user.username,
        is_admin: user.role === 'admin',
        message: message.trim().substring(0, 200),
        emoji: emoji || null
      });

      // Broadcast through global socket IO if available
      if (req.app.get('io')) {
        req.app.get('io').emit('chat_message', chatMsg);
      }

      return res.status(201).json({ success: true, chatMsg });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
  }
};

module.exports = gameController;
