const express = require('express');
const multer = require("multer");
const path = require("path");

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
router.post('/add', cloudUpload.any(), logbookController.addEntry);



router.get('/:email', logbookController.getEntries); // 🔹 Use email instead of userId
router.put('/update', logbookController.updateEntry); // ✅ Add update route
router.get('/review-status/:email', logbookController.getEntriesByReviewStatus); // ✅ New route for reviewed/not reviewed

module.exports = router;
