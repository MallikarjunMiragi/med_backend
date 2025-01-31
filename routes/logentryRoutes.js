const express = require('express');
const router = express.Router();
const logbookController = require('../controllers/logentryController');

router.post('/add', logbookController.addEntry);
router.get('/:userId', logbookController.getEntries);

module.exports = router;


