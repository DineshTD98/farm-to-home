const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const User = require('./models/User');
const bcrypt = require('bcryptjs');

console.log('URI:', process.env.MONGO_URI ? 'Present' : 'Missing');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const users = await User.find({}).limit(3);
        console.log("Total users found:", users.length);
        for(let u of users) {
          console.log(`User: Phone=${u.phone}, Email=${u.email}, Role=${u.role}`);
          console.log(`Password Hash starts with: ${u.password.substring(0, 10)}`);
          // Try to match a dummy password to see if matchPassword throws
          const match = await u.matchPassword('Testpass@123');
          console.log(`Password match with 'Testpass@123':`, match);
        }
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
});
