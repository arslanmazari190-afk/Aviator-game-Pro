const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { JWT_SECRET, JWT_EXPIRY } = require('../config/constants');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;
const RESERVED_USERNAMES = new Set(['admin', 'administrator', 'system']);

function createUsername(name) {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 40)
    .toLowerCase() || 'player';
  let username = base;
  let suffix = 1;

  while (db.findUserByUsername(username)) {
    const ending = String(suffix++);
    username = `${base.slice(0, 50 - ending.length)}${ending}`;
  }

  return username;
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, name: user.name || user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

const authController = {
  // Register new player
  register: (req, res) => {
    try {
      const { name: rawName, username: legacyUsername, email: rawEmail, phone: rawPhone, password } = req.body || {};
      const nameInput = typeof rawName === 'string' ? rawName : legacyUsername;
      const name = typeof nameInput === 'string' ? nameInput.trim().replace(/\s+/g, ' ') : '';
      const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
      const phoneInput = typeof rawPhone === 'string' ? rawPhone.trim() : '';
      const phone = phoneInput.replace(/\D/g, '');

      if (!name || !email || !phoneInput || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, phone number, and password are required.' });
      }

      if (name.length < 2 || name.length > 50 || /[\u0000-\u001f\u007f]/.test(name)) {
        return res.status(400).json({ success: false, message: 'Name must be between 2 and 50 characters.' });
      }

      if (!EMAIL_PATTERN.test(email) || email.length > 100) {
        return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
      }

      if (!PHONE_PATTERN.test(phoneInput) || phone.length < 7 || phone.length > 15) {
        return res.status(400).json({ success: false, message: 'Enter a valid phone number with 7 to 15 digits.' });
      }

      if (db.findUserByEmail(email)) {
        return res.status(400).json({ success: false, message: 'Email is already registered.' });
      }

      if (db.findUserByPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Phone number is already registered.' });
      }

      if (RESERVED_USERNAMES.has(name.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Please choose a different name.' });
      }

      if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and no more than 72 bytes.' });
      }

      const user = db.createUser({
        username: createUsername(name),
        name,
        email,
        phone,
        password_hash: bcrypt.hashSync(password, bcrypt.genSaltSync(12)),
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
      const { identifier: rawIdentifier, password } = req.body || {};
      const identifier = typeof rawIdentifier === 'string' ? rawIdentifier.trim() : '';

      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Email or phone number and password are required.' });
      }

      let user = db.findUserByEmail(identifier);
      if (!user) {
        user = db.findUserByPhone(identifier);
      }
      if (!user) {
        user = db.findUserByUsername(identifier);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = typeof password === 'string' && bcrypt.compareSync(password, user.password_hash);
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
