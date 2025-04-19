require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Start server only after DB connects
connectDB().then(() => {
  app.use(cors());
  app.use(express.json());

  // Root check
  app.get('/', (req, res) => {
    res.send('Chatbot API is running');
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api', chatRoutes);

  // PORT logic for Render and local
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

}).catch((err) => {
  console.error("Server failed to start due to MongoDB connection issues:", err);
});
