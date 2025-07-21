const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Gemini client setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const upload = multer({ dest: 'uploads/' });

// Retry wrapper for Gemini requests
const retryGeminiCall = async (model, prompt, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn(`Gemini retry ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
};


// 📝 Parse form fields from transcript text
router.post('/parse-form-fields', async (req, res) => {
  try {
    const { transcript, fieldNames } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'transcript is required' });
    }

    // Optionally, allow frontend to specify expected field names for more accurate extraction
    let fieldListText = '';
    if (Array.isArray(fieldNames) && fieldNames.length > 0) {
      fieldListText = `\nThe expected form fields are: ${fieldNames.join(', ')}.`;
    }

    const inputPrompt = `You are an expert medical form assistant. Extract the following form fields and their values from the transcript below.\n${fieldListText}\n\nReturn ONLY a valid JSON object mapping field names to their values.\n\nTranscript:\n${transcript}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const geminiResponse = await retryGeminiCall(model, inputPrompt);

    // Try to parse Gemini's response as JSON
    let fields = null;
    try {
      fields = JSON.parse(geminiResponse);
    } catch (parseErr) {
      // If Gemini returns non-JSON, wrap as string
      return res.status(200).json({ error: 'Could not parse Gemini response as JSON', raw: geminiResponse });
    }

    res.json({ fields });
  } catch (error) {
    console.error('Gemini parse-form-fields error:', error?.message || error);
    res.status(503).json({ error: 'Form field extraction unavailable. Please try again later.' });
  }
});

// 🔍 Summarize a full entry (with optional file)
router.post('/summarize', upload.single('file'), async (req, res) => {
  try {
    const { entryData } = req.body;

    if (!entryData) {
      return res.status(400).json({ error: 'entryData is required' });
    }

    const parsedData = JSON.parse(entryData);
    delete parsedData.patientName;
    delete parsedData.patientLocation;
    delete parsedData.Name;
    delete parsedData.Location;

    // Flatten deeply nested objects (optional for clean prompt)
    for (const key in parsedData) {
      if (typeof parsedData[key] === 'object') {
        parsedData[key] = JSON.stringify(parsedData[key]);
      }
    }

    let fileText = '';
    if (req.file) {
      try {
        fileText = fs.readFileSync(req.file.path, 'utf-8');
        fs.unlinkSync(req.file.path); // Clean up temp file
      } catch (fileError) {
        console.warn("Failed to read or delete uploaded file:", fileError.message);
      }
    }

    const inputPrompt = `
You are a clinical assistant. Generate a brief, professional, and formal summary of the student's medical entry. Do NOT include patient name or location. Base the summary only on the following data and attached text.

Structured Entry Data:
${JSON.stringify(parsedData, null, 2)}

Attached Notes (if any):
${fileText || 'No attached notes.'}
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const summary = await retryGeminiCall(model, inputPrompt); // 🔁 retries 3x on failure

    res.json({ summary });
  } catch (error) {
    console.error('Gemini summarization error:', error?.message || error);
    // Optional fallback
    const fallback = "Summary unavailable due to model overload. Please try again later.";
    res.status(503).json({ summary: fallback, fallback: true });
  }
});

module.exports = router;