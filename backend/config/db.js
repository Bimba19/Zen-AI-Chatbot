const mongoose = require('mongoose');

const isRender = process.env.RENDER;

const mongoURI = isRender
  ? process.env.MONGO_URI
  : 'mongodb://localhost:27017/zenbotDB';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error; // Let the caller handle it
  }
};

module.exports = connectDB;
