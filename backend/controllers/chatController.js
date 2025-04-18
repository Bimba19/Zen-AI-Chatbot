const axios = require('axios');

// Predefined response data
const predefinedResponses = {
  health: [
    "A healthy outside starts from the inside. — Robert Urich",
    "Mental health is just as important as physical health.",
    "What are some healthy habits I can add to my routine?",
    "How can I reduce stress effectively?",
  ],
  diet: [
    "Eating a variety of nutrient-rich foods helps your body function at its best.",
    "Drinking plenty of water throughout the day keeps you hydrated and supports healthy digestion.",
    "Limiting processed foods and eating whole, fresh foods is key to a healthy diet.",
    "Including more fruits and vegetables in your meals can provide essential vitamins and minerals.",
    "Don't skip meals. Having balanced meals regularly helps maintain energy levels.",
  ],
  importanceOfHealthyDiet: [
    "A healthy diet boosts your immune system and reduces the risk of chronic diseases.",
    "Eating a balanced diet helps maintain healthy weight and improves overall well-being.",
    "Proper nutrition is essential for mental clarity, energy, and mood regulation.",
    "A healthy diet supports good skin, hair, and a stronger body.",
  ],
  quotes: [
    "Let food be thy medicine and medicine be thy food. — Hippocrates",
    "You are what you eat. — Anonymous",
    "Healthy eating is a way of life, so it’s important to establish routines that are simple, realistic, and ultimately livable. — Horace",
    "A healthy diet is a solution to many of our health-care problems. — T. Colin Campbell",
  ],
  exercise: [
    "Exercise strengthens your muscles, boosts your mood, and improves cardiovascular health.",
    "Aim for 30 minutes of moderate exercise daily — walking, cycling, or swimming are great!",
    "Regular physical activity reduces risk of diabetes, heart disease, and obesity.",
  ],
  mentalHealth: [
    "Mental health is as important as physical health — care for your mind daily.",
    "Practice mindfulness, talk to someone, and take breaks for mental well-being.",
    "It's okay to ask for help. You're not alone — mental health matters.",
  ],
  dietPlans: {
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
  },
  casualResponses: {
    hi: ["Hey there!", "Hello! 👋", "Hi! How can I assist you today?"],
    hello: ["Hello! How can I help?", "Hi there!", "Hey! What can I do for you?"],
    "how are you": ["I'm doing great, thanks for asking! 😊", "I'm good! How about you?", "I'm fantastic, thanks for asking!"],
    "how was your day": ["My day is going well, thanks! How about yours?", "Great day so far! You?", "It’s been a productive day!"],
    thankYou: ["You're welcome!", "No problem! 😊", "Glad to help!"],
    bye: ["Goodbye! Take care! 👋", "See you soon!", "Bye! Have a great day!"],
    "who are you": ["I'm ZenBot, your friendly assistant!", "ZenBot here to help! 🤖"],
    "your name": ["I'm ZenBot, nice to meet you!"],
    help: ["Sure! Ask me anything related to health, diet, or well-being."],
    "what can you do": ["I can provide tips on health, diet plans, and answer your wellness queries."],
  },
};

function getRandomResponse(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Handle incoming messages
exports.handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const lowerMsg = message.trim().toLowerCase();

  if (process.env.NODE_ENV === "development") {
    console.log("Received message:", lowerMsg);
  }

  try {
    // Predefined keys
    const predefinedResponseKeys = [
      "health", "diet", "importanceOfHealthyDiet", "quotes",
      "exercise", "mentalHealth",
      "dietPlanForChildren", "dietPlanForTeenagers", "dietPlanForAdults", "dietPlanForSeniors"
    ];

    for (let key of predefinedResponseKeys) {
      if (lowerMsg === key.toLowerCase()) {
        let response;
        if (key.startsWith("dietPlanFor")) {
          const group = key.replace("dietPlanFor", "").toLowerCase();
          response = predefinedResponses.dietPlans[group];
        } else {
          response = predefinedResponses[key];
        }
        return res.json({ reply: Array.isArray(response) ? getRandomResponse(response) : response });
      }
    }

    // Casual conversation matching
    const words = lowerMsg.split(/\s+/);
    for (const keyword in predefinedResponses.casualResponses) {
      if (lowerMsg.includes(keyword) || words.includes(keyword)) {
        return res.json({ reply: getRandomResponse(predefinedResponses.casualResponses[keyword]) });
      }
    }

    // Fallback to Hugging Face API
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    const model = process.env.HUGGING_FACE_MODEL || "gpt2";

    if (!apiKey) {
      console.error("HUGGING_FACE_API_KEY is missing");
      return res.status(500).json({ error: "Hugging Face API key not found." });
    }

    const endpoint = `https://api-inference.huggingface.co/models/${model}`;

    const response = await axios.post(
      endpoint,
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    ).catch(err => {
      console.error('API Request Error:', err.message);
      if (err.code === 'ECONNABORTED') {
        return res.status(503).json({ reply: "The server took too long to respond. Please try again later." });
      }
      return res.status(503).json({ reply: "Sorry, something went wrong. Please try again later." });
    });

    const aiResponse = Array.isArray(response.data)
      ? response.data[0]?.generated_text
      : response.data?.generated_text;

    if (!aiResponse || typeof aiResponse !== "string") {
      return res.json({ reply: "Sorry, I couldn't generate a response." });
    }

    return res.json({ reply: aiResponse.trim() });

  } catch (error) {
    console.error("Chat Handler Error:", error.message || error);
    return res.status(503).json({
      reply: "Sorry, I'm having trouble right now. Try again in a bit!"
    });
  }
};
