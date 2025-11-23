require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const email = 'owner@example.com';
  let u = await User.findOne({ email });
  if (!u) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('ownerpass', 10);
    u = await User.create({ name: 'Owner', email, passwordHash, role: 'owner' });
    console.log('Owner created: owner@example.com / ownerpass');
  } else {
    u.role = 'owner';
    await u.save();
    console.log('Owner role granted to owner@example.com');
  }
  process.exit(0);
}
run();
