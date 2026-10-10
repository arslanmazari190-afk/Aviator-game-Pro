const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/recent-rounds', gameController.getRecentRounds);
router.get('/round/:id', gameController.getRoundDetails);
router.post('/verify', gameController.verifyGameHash);
router.get('/my-bets', authenticate, gameController.getMyBets);
router.get('/top-wins', gameController.getTopWins);
router.post('/chat', authenticate, gameController.postChatMessage);

module.exports = router;
