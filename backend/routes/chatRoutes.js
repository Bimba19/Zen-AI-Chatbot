const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { handleChat, getHistory, deleteMessage } = require('../controllers/chatController');

// Define routes
router.post('/chat', authenticate, handleChat);  // <-- updated to handleChat
router.get('/chat/history', authenticate, getHistory);
router.delete('/chat/history/:id', authenticate, deleteMessage);

module.exports = router;
