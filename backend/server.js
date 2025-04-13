require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('Chatbot API is running');
});

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const chatRoutes = require('./routes/chatRoutes'); // Hugging Face enabled
app.use('/api', chatRoutes);

// Check if Hugging Face token is loaded
console.log("✅ HUGGINGFACE_API_TOKEN loaded?", !!process.env.HUGGINGFACE_API_TOKEN);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
