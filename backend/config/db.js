const mongoose = require('mongoose');

// Check if the app is running locally or in a cloud environment like Render
const isRender = process.env.RENDER; // Render sets this environment variable by default

const mongoURI = isRender
  ? process.env.MONGO_URI  // Use Render MongoDB URI (set in Render environment variables)
  : 'mongodb://localhost:27017/zenbotDB'; // Local MongoDB URI

const connectDB = async () => {
  try {
<<<<<<< HEAD
    await mongoose.connect(process.env.MONGO_URI); // No need for the deprecated options
=======
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
>>>>>>> 81cceb668298ee272b2c609e3aca49158a5bb33f
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error.message);
    process.exit(1);  // Exit the process with failure
  }
};

module.exports = connectDB;
