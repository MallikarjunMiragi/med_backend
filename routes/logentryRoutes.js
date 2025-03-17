const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logentryController');

router.post('/add', logbookController.addEntry);
router.get('/:email', logbookController.getEntries); // 🔹 Use email instead of userId
router.put('/update', logbookController.updateEntry); // ✅ Add update route
router.get('/review-status/:email', logbookController.getEntriesByReviewStatus); // ✅ New route for reviewed/not reviewed

module.exports = router;
