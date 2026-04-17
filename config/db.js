const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      ssl: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
