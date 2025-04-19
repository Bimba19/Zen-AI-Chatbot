require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const morgan = require('morgan');  // Optional: for logging HTTP requests

const app = express();

// Middleware for logging (optional)
app.use(morgan('dev'));

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

  // Error handling middleware for unhandled routes
  app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
  });

  // General error handling middleware
  app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
  });

  // PORT logic for Render and local
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Server terminated gracefully');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => {
      console.log('Server terminated gracefully');
      process.exit(0);
    });
  });

}).catch((err) => {
  console.error("Server failed to start due to MongoDB connection issues:", err);
  process.exit(1);  // Exit the process if the DB connection fails
});
