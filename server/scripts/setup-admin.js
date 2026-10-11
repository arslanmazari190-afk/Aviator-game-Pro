const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../src/db/db');

const email = (process.argv[2] || '').trim().toLowerCase();

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: node scripts/setup-admin.js <account-email>');
  process.exitCode = 1;
} else if (['demo@aviator.local', 'admin@aviator.local'].includes(email)) {
  console.error('Built-in demo accounts cannot be admins. Use your personal email address.');
  process.exitCode = 1;
} else {
  const password = crypto.randomBytes(24).toString('base64url');
  const password_hash = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
  let user = db.findUserByEmail(email);

  if (user) {
    user = db.updateUser(user.id, { role: 'ADMIN', password_hash, is_frozen: false });
  } else {
    const baseUsername = email.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 20) || 'admin';
    let username = baseUsername;
    let suffix = 1;

    while (db.findUserByUsername(username)) {
      const ending = String(suffix++);
      username = `${baseUsername.slice(0, 20 - ending.length)}${ending}`;
    }

    user = db.createUser({
      username,
      email,
      password_hash,
      role: 'ADMIN',
      balance_pkr: 0,
      balance_usdt: 0
    });
  }

  console.log(`Admin account ready: ${user.email}`);
  console.log(`Username: ${user.username}`);
  console.log(`Temporary password: ${password}`);
  console.log('Save this password now; it is not stored in plaintext.');
}
