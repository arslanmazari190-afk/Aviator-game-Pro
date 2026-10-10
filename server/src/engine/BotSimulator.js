const BOT_NAMES = [
  'Hamza_99', 'Ali_Trader', 'CryptoKing_PK', 'Zainab_77', 'Usman_Pro', 
  'Sara_Khan', 'Bilal_PK', 'CyberFalcon', 'LuckyStrike', 'Ahmad_Lahore', 
  'Fatima_R', 'Waqas_Rider', 'CryptoWhale', 'Shahid_10x', 'Apex_Pilot',
  'Tariq_Jet', 'Noor_786', 'MoonShooter', 'SkyCaptain', 'Hassan_Vip',
  'Raza_Win', 'Danish_Fly', 'Saima_Gold', 'Imran_Bull', 'Asad_Cash'
];

const BOT_MESSAGES = [
  { message: 'Let\'s go 5x this round! 🚀', emoji: '🚀' },
  { message: 'Cashed out nicely at 2.40x 💰', emoji: '💰' },
  { message: 'Waiting for a 10x rocket 🔥', emoji: '🔥' },
  { message: 'EasyPaisa deposit arrived instantly, loving this! ⚡', emoji: '⚡' },
  { message: 'Auto cashout at 2.0x is the safest strategy 🎯', emoji: '🎯' },
  { message: 'Huge win! 🎉 PKR 12,000 cashed out!', emoji: '🎉' },
  { message: 'Who is holding above 10x? 👀', emoji: '👀' },
  { message: 'Just doubled my USDT balance 🤑', emoji: '🤑' },
  { message: 'Next round will be huge!', emoji: '✈️' },
  { message: 'Nice streak today boys! 📈', emoji: '📈' }
];

class BotSimulator {
  constructor() {
    this.activeBotBets = [];
  }

  generateRoundBots(count = 12) {
    this.activeBotBets = [];
    const shuffled = [...BOT_NAMES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    for (const name of selected) {
      const isUSDT = Math.random() < 0.25;
      const currency = isUSDT ? 'USDT' : 'PKR';
      
      let amount;
      if (isUSDT) {
        const presets = [2, 5, 10, 20, 50, 100];
        amount = presets[Math.floor(Math.random() * presets.length)];
      } else {
        const presets = [100, 200, 500, 1000, 2000, 5000, 10000];
        amount = presets[Math.floor(Math.random() * presets.length)];
      }

      // Realistic target cashout distribution
      let targetCashout;
      const roll = Math.random();
      if (roll < 0.45) {
        targetCashout = Number((1.10 + Math.random() * 0.90).toFixed(2)); // 1.10x - 2.00x
      } else if (roll < 0.80) {
        targetCashout = Number((2.00 + Math.random() * 3.00).toFixed(2)); // 2.00x - 5.00x
      } else if (roll < 0.95) {
        targetCashout = Number((5.00 + Math.random() * 10.00).toFixed(2)); // 5.00x - 15.00x
      } else {
        targetCashout = Number((15.00 + Math.random() * 40.00).toFixed(2)); // 15.00x - 55.00x
      }

      this.activeBotBets.push({
        id: `bot_${Math.random().toString(36).substring(2, 9)}`,
        username: name,
        bet_number: 1,
        currency,
        amount,
        targetCashout,
        status: 'ACTIVE',
        payout: 0,
        is_bot: true,
        created_at: new Date().toISOString()
      });
    }

    return this.activeBotBets;
  }

  processBotCashouts(currentMultiplier) {
    const cashedOutBots = [];
    for (const bot of this.activeBotBets) {
      if (bot.status === 'ACTIVE' && currentMultiplier >= bot.targetCashout) {
        bot.status = 'WON';
        bot.cashout_multiplier = currentMultiplier;
        bot.payout = Number((bot.amount * currentMultiplier).toFixed(2));
        bot.cashed_at = new Date().toISOString();
        cashedOutBots.push(bot);
      }
    }
    return cashedOutBots;
  }

  getRandomChatMessage() {
    const randomBot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const randomMsg = BOT_MESSAGES[Math.floor(Math.random() * BOT_MESSAGES.length)];
    return {
      username: randomBot,
      is_admin: false,
      message: randomMsg.message,
      emoji: randomMsg.emoji,
      created_at: new Date().toISOString()
    };
  }
}

module.exports = new BotSimulator();
