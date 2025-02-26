const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logentryController');

router.post('/add', logbookController.addEntry);
router.get('/:email', logbookController.getEntries); // 🔹 Use email instead of userId

module.exports = router;
