const express = require('express');
const multer = require("multer");
const path = require("path");
const LogEntry = require("../models/LogEntry");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const router = express.Router();
const logbookController = require('../controllers/logentryController');

//router.post('/add', logbookController.addEntry);
const memoryStorage = multer.memoryStorage();
const cloudUpload = multer({ storage: memoryStorage });
router.post("/add", upload.any(), async (req, res) => {
  try {
    const { email, categoryId } = req.body;

    const fields = {};
    const files = [];

    // Capture regular form fields (excluding file metadata)
    Object.entries(req.body).forEach(([key, value]) => {
      if (!['email', 'categoryId'].includes(key) && !key.includes('_title') && !key.includes('_description') && !key.includes('_name') && !key.includes('_type')) {
        fields[key] = value;
      }
    });

    // Capture file + metadata
    req.files?.forEach((file) => {
      const fieldName = file.fieldname;

      files.push({
        fieldName,
        buffer: file.buffer,
        originalName: file.originalname,
        title: req.body[`${fieldName}_title`] || "",
        name: req.body[`${fieldName}_name`] || "",
        type: req.body[`${fieldName}_type`] || "",
        description: req.body[`${fieldName}_description`] || ""
      });
    });

    const log = new LogEntry({
      email,
      categoryId,
      fields,
      files
    });

    await log.save();
    res.status(201).json({ message: "Log entry saved" });
  } catch (err) {
    console.error("Error saving log entry:", err);
    res.status(500).json({ error: "Server error" });
  }
});




router.get('/:email', logbookController.getEntries); // 🔹 Use email instead of userId
router.put('/update', logbookController.updateEntry); // ✅ Add update route
router.get('/review-status/:email', logbookController.getEntriesByReviewStatus); 
// ✅ New route for reviewed/not reviewed
router.get("/average-score/:email", logbookController.getAverageScore);
module.exports = router;
