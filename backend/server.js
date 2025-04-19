require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authenticate = require('./middleware/authMiddleware');
const axios = require('axios');
const Message = require('./models/Message');

const app = express();

// Health Tips Predefined Responses
const healthTips = [
  "A healthy outside starts from the inside. — Robert Urich",
  "Mental health is just as important as physical health.",
  "What are some healthy habits I can add to my routine?",
  "How can I reduce stress effectively?",
];

// Start server only after DB connects
connectDB().then(() => {
  app.use(cors());
  app.use(express.json());

  // Root check
  app.get('/', (req, res) => {
    res.send('Chatbot API is running');
  });

  // Chat route
  app.post('/api/chat', authenticate, async (req, res) => {
    try {
      const userMessage = req.body.message.trim().toLowerCase();
      if (!userMessage) {
        return res.status(400).json({ reply: "Message is required." });
      }

      const predefinedResponses = {
        "health": healthTips.join(' '),
        "diet": "A balanced diet includes fruits, vegetables, proteins, and whole grains.",
        "importance of healthy diet": "A healthy diet boosts immunity, energy levels, and overall well-being.",
        "exercise": "Daily exercise improves strength, flexibility, and mental health.",
        "mental health": "Prioritize sleep, connect with loved ones, and seek help when needed.",
        "quote": "Believe you can and you're halfway there. — Theodore Roosevelt"
      };

      const matchingResponse = Object.keys(predefinedResponses).find(key =>
        userMessage.includes(key)
      );

      if (matchingResponse) {
        const finalReply = predefinedResponses[matchingResponse];

        await Message.create({
          user: req.user.id,
          userMessage,
          botReply: finalReply,
        });

        return res.json({ reply: finalReply });
      }

      // HuggingFace fallback
      const huggingFaceKey = process.env.HUGGINGFACE_API_KEY;
      const huggingFaceModel = process.env.HUGGINGFACE_MODEL || "sshleifer/tiny-gpt2";

      if (!huggingFaceKey) {
        console.error("HUGGINGFACE_API_KEY is missing in .env");
        return res.status(500).json({ reply: "API key not found on server." });
      }

      const endpoint = `https://api-inference.huggingface.co/models/${huggingFaceModel}`;
      const prompt = `
You are ZenBot, a helpful and polite assistant that gives short, clear, and relevant replies to users.

User: ${req.body.message}
ZenBot:
`;

      const response = await axios.post(
        endpoint,
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${huggingFaceKey}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      let aiReply;
      if (Array.isArray(response.data)) {
        aiReply = response.data[0]?.generated_text;
      } else {
        aiReply = response.data?.generated_text;
      }

      const finalReply = aiReply?.replace(prompt, "").trim() || "Sorry, I couldn't reply.";

      await Message.create({
        user: req.user.id,
        userMessage: req.body.message,
        botReply: finalReply,
      });

      res.json({ reply: finalReply });

    } catch (err) {
      console.error("Error:", err.message || err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
      res.status(503).json({ reply: "The AI is currently unavailable. Please try again later." });
    }
  });

  // Chat History
  app.get('/api/chat/history', authenticate, async (req, res) => {
    try {
      const history = await Message.find({ user: req.user.id }).sort({ timestamp: -1 });
      res.json({ history });
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Delete message from history
  app.delete('/api/chat/history/:id', authenticate, async (req, res) => {
    try {
      const deleted = await Message.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id,
      });

      if (!deleted) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.json({ success: true, message: "Message deleted" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });

  // Auth and other routes
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);

  const chatRoutes = require('./routes/chatRoutes');
  app.use('/api', chatRoutes);

  // ✅ PORT logic for Render and local
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
  });

}).catch((err) => {
  console.error("❌ Server failed to start due to MongoDB connection issues:", err);
});
