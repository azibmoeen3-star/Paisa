const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ok-backend';
const isUsingAtlas = mongoUri.startsWith('mongodb+srv://');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB using:', isUsingAtlas ? 'mongodb+srv://<masked-host>' : mongoUri);
    console.log('MongoDB URI source:', process.env.MONGODB_URI ? 'MONGODB_URI env var' : 'local fallback');

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
