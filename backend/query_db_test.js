const mongoose = require('mongoose');
const uri = "mongodb+srv://F2Happ:Coolbuddy%4019@cluster1.kztyalx.mongodb.net/?appName=Cluster1";
mongoose.connect(uri).then(async () => {
  const users = await mongoose.connection.db.collection('users').countDocuments();
  console.log(`Users in default (test) DB: ${users}`);
  mongoose.disconnect();
});
