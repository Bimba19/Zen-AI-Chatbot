const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const axios = require("axios");
const Message = require("../models/Message");
require("dotenv").config();

router.post("/chat", authenticate, async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "Message is required." });
    }

    const apiKey = process.env.HUGGINGFACE_API_TOKEN;
    if (!apiKey) {
      console.error(" HUGGINGFACE_API_TOKEN is missing in .env");
      return res.status(500).json({ reply: "API key not found on server." });
    }

    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
      {
        inputs: `<s>[INST] ${userMessage} [/INST]`,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const output = hfResponse.data?.[0]?.generated_text || "Sorry, I couldn't reply.";
    const cleanReply = output.split("[/INST]")[1]?.trim() || output.trim();

    // Save to MongoDB
    await Message.create({
      user: req.user.id,
      userMessage,
      botReply: cleanReply,
    });

    res.json({ reply: cleanReply });
  } catch (err) {
    console.error("🔥 Hugging Face API Error:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }

    res.status(500).json({
      reply:
        err.response?.data?.error ||
        "The AI is busy. Please try again in a few minutes.",
    });
  }
});

//  Route to fetch chat history
router.get("/chat/history", authenticate, async (req, res) => {
  try {
    const history = await Message.find({ user: req.user.id }).sort({ timestamp: -1 });
    res.json({ history });
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

module.exports = router;
//  Route to delete a single message by ID
router.delete("/chat/history/:id", authenticate, async (req, res) => {
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
    console.error("❌ Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

