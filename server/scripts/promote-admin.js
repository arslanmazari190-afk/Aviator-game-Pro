const db = require('../src/db/db');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/promote-admin.js <account-email>');
  process.exitCode = 1;
} else {
  const user = db.findUserByEmail(email);

  if (!user) {
    console.error(`No account found for ${email}.`);
    process.exitCode = 1;
  } else if (['demo@aviator.local', 'admin@aviator.local'].includes(user.email.toLowerCase())) {
    console.error('Built-in demo accounts cannot be admins. Promote a personal account instead.');
    process.exitCode = 1;
  } else {
    db.updateUser(user.id, { role: 'ADMIN' });
    console.log(`Promoted ${user.username} (${user.email}) to ADMIN.`);
  }
}
