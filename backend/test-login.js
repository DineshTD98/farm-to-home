const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find({}).limit(5);
  for (let u of users) {
    console.log(u.phone, u.password.substring(0, 15) + '...');
  }
  process.exit(0);
});
