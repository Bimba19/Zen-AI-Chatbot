const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const {
  chatHandler,
  getHistory,
  deleteMessage
} = require('../controllers/chatController');

router.post('/chat', authenticate, chatHandler);
router.get('/chat/history', authenticate, getHistory);
router.delete('/chat/history/:id', authenticate, deleteMessage);

module.exports = router;
