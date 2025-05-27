// routes/courseSuggestionRoute.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Route: POST /api/suggest-courses
router.post('/suggest-courses', async (req, res) => {
  const { specialty } = req.body;

  if (!specialty) {
    return res.status(400).json({ error: 'Specialty is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(`
Suggest high-quality free online courses, YouTube videos, or study materials for the medical specialty "${specialty}". 
Respond in this format:
- **Course Title**: ...
- **Link**: ...
- **Description**: ...
Give 3 resources.
    `);

    const suggestions = result.response.text();
    res.status(200).json({ suggestions });

  } catch (error) {
    console.error('Gemini error for course suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch course suggestions' });
  }
});

module.exports = router;
