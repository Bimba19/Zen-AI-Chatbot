const axios = require('axios');

exports.handleChat = async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;

    //  Use 'reply' instead of 'response' for frontend compatibility
    res.status(200).json({ reply: aiResponse });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};
