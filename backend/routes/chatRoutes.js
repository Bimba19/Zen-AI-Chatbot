const axios = require("axios");

exports.handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message is required." });
  }

  // Custom responses
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

  // Casual responses for greetings and questions
  const casualResponses = {
    "hi": ["Hey there!", "Hello! 👋", "Hi! How can I assist you today?"],
    "how are you": ["I'm doing great, thanks for asking! 😊", "I'm good! How about you?", "I'm fantastic, thanks for asking!"],
    "how was your day": ["My day is going well, thanks for asking! How about yours?", "It’s been a great day! How's yours?", "It’s been a productive day, how about you?"],
    "hello": ["Hello! How can I help?", "Hi there!", "Hey! What can I do for you?"],
    "thank you": ["You're welcome!", "No problem! 😊", "Glad to help!"],
    "bye": ["Goodbye! Take care! 👋", "See you soon!", "Bye! Have a great day!"],
    "who are you": ["I'm ZenBot, your friendly assistant!", "ZenBot here to help you! 🤖"],
    "your name": ["I'm ZenBot, nice to meet you!"],
    "help": ["Sure! Ask me anything related to health, diet, or well-being."],
    "what can you do": ["I can provide tips on health, diet plans, and answer your wellness queries."],
  };

  // Exercise and mental health information
  const exerciseInfo = [
    "Exercise is crucial for maintaining good health. It strengthens your muscles, boosts your mood, and improves cardiovascular health.",
    "Aim for at least 30 minutes of moderate exercise a day. Activities like walking, cycling, or swimming are great for overall fitness.",
    "Regular exercise helps reduce the risk of chronic diseases like diabetes, heart disease, and obesity.",
  ];

  const mentalHealthInfo = [
    "Mental health is just as important as physical health. It’s essential to take care of your mind just like you take care of your body.",
    "Taking time for yourself, practicing mindfulness, and talking to someone when you feel overwhelmed can help maintain your mental health.",
    "It's okay to not be okay sometimes. Seeking professional help is a positive step toward mental well-being.",
  ];

  const lowerMsg = message.toLowerCase();  // Convert the message to lowercase

  // Casual responses (Greetings & Simple Questions)
  for (const key in casualResponses) {
    if (lowerMsg.includes(key)) {
      const replyList = casualResponses[key];
      return res.json({ reply: replyList[Math.floor(Math.random() * replyList.length)] });
    }
  }

  // Keyword-based custom responses
  if (lowerMsg === "health") {
    return res.json({
      reply: healthTips[Math.floor(Math.random() * healthTips.length)],
    });
  }
  if (lowerMsg === "diet") {
    return res.json({
      reply: dietTips[Math.floor(Math.random() * dietTips.length)],
    });
  }
  if (lowerMsg === "importance of healthy diet") {
    return res.json({
      reply:
        importanceOfHealthyDiet[
          Math.floor(Math.random() * importanceOfHealthyDiet.length)
        ],
    });
  }
  if (lowerMsg === "quote") {
    return res.json({
      reply: quotes[Math.floor(Math.random() * quotes.length)],
    });
  }
  if (lowerMsg === "diet plan for children") {
    return res.json({ reply: dietPlans.children.join(" ") });
  }
  if (lowerMsg === "diet plan for teenagers") {
    return res.json({ reply: dietPlans.teenagers.join(" ") });
  }
  if (lowerMsg === "diet plan for adults") {
    return res.json({ reply: dietPlans.adults.join(" ") });
  }
  if (lowerMsg === "diet plan for seniors") {
    return res.json({ reply: dietPlans.seniors.join(" ") });
  }

  // Exercise and Mental Health Information
  if (lowerMsg === "exercise") {
    return res.json({
      reply: exerciseInfo[Math.floor(Math.random() * exerciseInfo.length)],
    });
  }

  if (lowerMsg === "mental health") {
    return res.json({
      reply: mentalHealthInfo[Math.floor(Math.random() * mentalHealthInfo.length)],
    });
  }

  // Fallback: Hugging Face AI response
  const apiKey = process.env.HUGGING_FACE_API_KEY;
  const model = "gpt2"; // Tiny model for quick response
  const endpoint = `https://api-inference.huggingface.co/models/${model}`;

  if (!apiKey) {
    console.error("HUGGING_FACE_API_KEY is missing.");
    return res.status(500).json({ error: "Hugging Face API key not found." });
  }

  try {
    const hfResponse = await axios.post(
      endpoint,
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiResponse = "";

    if (Array.isArray(hfResponse.data)) {
      aiResponse = hfResponse.data[0]?.generated_text || "";
    } else if (
      typeof hfResponse.data === "object" &&
      hfResponse.data.generated_text
    ) {
      aiResponse = hfResponse.data.generated_text;
    }

    if (!aiResponse || typeof aiResponse !== "string") {
      aiResponse = "Sorry, I can't reply right now.";
    }

    return res.status(200).json({ reply: aiResponse.trim() });
  } catch (error) {
    const errData = error.response?.data;
    const errStatus = error.response?.status;
    const errMsg =
      errStatus === 503
        ? "Hugging Face service is temporarily unavailable. Please try again shortly."
        : errData?.error || error.message || "Unexpected error occurred.";

    console.error("Hugging Face Chat Error:", {
      status: errStatus,
      message: errMsg,
      full: errData,
    });

    return res.status(500).json({ error: errMsg });
  }
};
