const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// ✅ Initialize Gemini client properly
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/enhance', async (req, res) => {
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: 'Comment is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // ✅ Use supported model
    const result = await model.generateContent(`Enhance this doctor's comment briefly in formal way (give only one comment):\n"${comment}"`);
    const enhancedComment = result.response.text();

    res.json({ enhancedComment });
  } catch (error) {
    console.error('Gemini error details:', error);
    res.status(500).json({ error: 'Failed to enhance comment', details: error.message });
  }
});

module.exports = router;
