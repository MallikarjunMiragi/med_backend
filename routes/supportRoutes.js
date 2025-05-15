const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

// Student submits query
router.post('/support/submit', supportController.submitQuery);

// Admin fetches all queries
router.get('/support/all', supportController.getAllQueries);

// ✅ New: Admin marks query resolved
router.put('/support/resolve/:id', supportController.resolveQuery);

module.exports = router;
