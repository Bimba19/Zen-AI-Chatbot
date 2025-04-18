require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authenticate = require('./middleware/authMiddleware');
const axios = require('axios');
const Message = require('./models/Message');

const app = express();

// Predefined Responses
const healthTips = [
  "A healthy outside starts from the inside. — Robert Urich",
  "Mental health is just as important as physical health.",
  "What are some healthy habits I can add to my routine?",
  "How can I reduce stress effectively?",
];

const dietTips = [
  "Eating a variety of nutrient-rich foods helps your body function at its best.",
  "Drinking plenty of water throughout the day keeps you hydrated and supports healthy digestion.",
  "Limiting processed foods and eating whole, fresh foods is key to a healthy diet.",
  "Including more fruits and vegetables in your meals can provide essential vitamins and minerals.",
  "Don't skip meals. Having balanced meals regularly helps maintain energy levels.",
];

const importanceOfHealthyDiet = [
  "A healthy diet boosts your immune system and reduces the risk of chronic diseases.",
  "Eating a balanced diet helps maintain healthy weight and improves overall well-being.",
  "Proper nutrition is essential for mental clarity, energy, and mood regulation.",
  "A healthy diet supports good skin, hair, and a stronger body.",
];

const quotes = [
  "Let food be thy medicine and medicine be thy food. — Hippocrates",
  "You are what you eat. — Anonymous",
  "Healthy eating is a way of life, so it’s important to establish routines that are simple, realistic, and ultimately livable. — Horace",
  "A healthy diet is a solution to many of our health-care problems. — T. Colin Campbell",
];

const dietPlans = {
  children: [
    "Breakfast: Oatmeal with berries, scrambled eggs, and milk.",
    "Lunch: Whole grain sandwich with lean turkey, lettuce, and tomato.",
    "Dinner: Grilled chicken with brown rice and steamed vegetables.",
    "Snacks: Carrot sticks, apple slices with peanut butter, or low-fat yogurt.",
  ],
  teenagers: [
    "Breakfast: Whole grain toast with avocado and eggs, smoothie with spinach and banana.",
    "Lunch: Quinoa salad with grilled chicken, spinach, and a lemon dressing.",
    "Dinner: Grilled salmon, roasted potatoes, and broccoli.",
    "Snacks: Handful of nuts, mixed fruit, or yogurt parfait with granola.",
  ],
  adults: [
    "Breakfast: Whole wheat toast with avocado and scrambled eggs, a side of mixed fruit.",
    "Lunch: Grilled chicken breast with quinoa and steamed veggies.",
    "Dinner: Baked salmon with a side of brown rice and sautéed spinach.",
    "Snacks: Carrot sticks, hummus, or a small handful of almonds.",
  ],
  seniors: [
    "Breakfast: Steel-cut oatmeal with chia seeds and fruit.",
    "Lunch: Grilled chicken or fish with a side of leafy greens and roasted sweet potatoes.",
    "Dinner: Grilled vegetables with lean protein like chicken or turkey.",
    "Snacks: Low-fat cheese, fruit, or a handful of walnuts.",
  ],
};

const exerciseInfo = [
  "Regular exercise improves mental health, boosts energy levels, and helps with weight management.",
  "Aim for at least 150 minutes of moderate-intensity exercise per week for good health.",
  "Physical activity improves sleep quality and reduces the risk of chronic diseases like heart disease.",
];

const mentalHealthInfo = [
  "Taking time for self-care and practicing mindfulness can significantly reduce stress.",
  "Talking to someone you trust and seeking professional support can improve mental well-being.",
  "Regular exercise and a balanced diet also play important roles in mental health.",
];

// Express server setup
connectDB().then(() => {
  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Chatbot API is running');
  });

  app.post('/api/chat', authenticate, async (req, res) => {
    try {
      const userMessage = req.body.message.trim().toLowerCase();  // Convert message to lowercase
      if (!userMessage) {
        return res.status(400).json({ reply: "Message is required." });
      }

      // Predefined Responses for Keywords (updated to handle more cases)
      const predefinedResponses = {
        "health": healthTips.join(' '),
        "diet": dietTips.join(' '),
        "importance of healthy diet": importanceOfHealthyDiet.join(' '),
        "quotes": quotes.join(' '),
        "diet plan for children": dietPlans.children.join(' '),
        "diet plan for teenagers": dietPlans.teenagers.join(' '),
        "diet plan for adults": dietPlans.adults.join(' '),
        "diet plan for seniors": dietPlans.seniors.join(' '),
        "exercise info": exerciseInfo.join(' '),
        "mental health info": mentalHealthInfo.join(' '),
      };

      // Check if the user message matches any predefined responses
      const matchingResponse = Object.keys(predefinedResponses).find(key =>
        userMessage.includes(key)  // Check if the user input contains any of the predefined keys
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

      // If no predefined response, fallback to AI model (HuggingFace or others)
      const huggingFaceKey = process.env.HUGGINGFACE_API_KEY;
      const huggingFaceModel = process.env.HUGGINGFACE_MODEL || "tiny-gpt2";

      if (!huggingFaceKey) {
        console.error("HUGGINGFACE_API_KEY is missing in .env");
        return res.status(500).json({ reply: "API key not found on server." });
      }

      const endpoint = `https://api-inference.huggingface.co/models/${huggingFaceModel}`;

      // Enhanced Prompt for AI Response
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

      res.status(503).json({
        reply: "The AI is currently unavailable. Please try again later."
      });
    }
  });

  app.get('/api/chat/history', authenticate, async (req, res) => {
    try {
      const history = await Message.find({ user: req.user.id }).sort({ timestamp: -1 });
      res.json({ history });
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

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

  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

}).catch((err) => {
  console.error("Server failed to start due to MongoDB connection issues:", err);
});
