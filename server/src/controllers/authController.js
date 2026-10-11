const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { JWT_SECRET, JWT_EXPIRY } = require('../config/constants');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

const authController = {
  // Register new player
  register: (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }

      if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ success: false, message: 'Username must be between 3 and 20 characters.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      }

      if (db.findUserByUsername(username)) {
        return res.status(400).json({ success: false, message: 'Username is already taken.' });
      }

      if (db.findUserByEmail(email)) {
        return res.status(400).json({ success: false, message: 'Email is already registered.' });
      }

      const salt = bcrypt.genSaltSync(10);
      const password_hash = bcrypt.hashSync(password, salt);

      const user = db.createUser({
        username,
        email,
        password_hash,
        role: 'USER',
        balance_pkr: 5000.00, // Welcome bonus 5,000 PKR for instant play!
        balance_usdt: 20.00   // Welcome bonus 20 USDT
      });

      const token = generateToken(user);
      const { password_hash: _, ...safeUser } = user;

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome bonus credited.',
        token,
        user: safeUser
      });
    } catch (err) {
      console.error('[AUTH REGISTER ERROR]', err);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  // Login
  login: (req, res) => {
    try {
      const { identifier, password } = req.body; // identifier can be username or email

      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Username/email and password required.' });
      }

      let user = db.findUserByEmail(identifier);
      if (!user) {
        user = db.findUserByUsername(identifier);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      if (user.is_frozen) {
        return res.status(403).json({ success: false, message: 'Account is frozen. Please contact support.' });
      }

      const token = generateToken(user);
      const { password_hash: _, ...safeUser } = user;

      return res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: safeUser
      });
    } catch (err) {
      console.error('[AUTH LOGIN ERROR]', err);
      return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  },

  // Get current logged-in user profile & balances
  getMe: (req, res) => {
    const user = db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { password_hash: _, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  },

  // Instant 1-Click Demo Login
  demoLogin: (req, res) => {
    try {
      const demoUser = db.findUserByEmail('demo@aviator.local');
      if (!demoUser || demoUser.role !== 'USER' || demoUser.is_frozen) {
        return res.status(404).json({ success: false, message: 'Demo account is unavailable.' });
      }
      const token = generateToken(demoUser);
      const { password_hash: _, ...safeUser } = demoUser;

      return res.json({
        success: true,
        message: 'Demo account loaded with test balance.',
        token,
        user: safeUser
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Error loading demo user.' });
    }
  },

};

module.exports = authController;
