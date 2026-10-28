require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@shop.com';
  const exists = await User.findOne({ email });

  if (exists) {
    console.log('Admin already exists');
  } else {
    await User.create({
      name: 'Main Admin',
      email,
      password: 'Admin123456',
      role: 'admin',
    });
    console.log('Admin created: admin@shop.com / Admin123456');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});