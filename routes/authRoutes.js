const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Adjust the path

// Routes for signup and login
router.post('/signup', authController.signup);
router.post('/login', authController.login);
// Add this route to fetch all users
router.get('/users', authController.getAllUsers);

module.exports = router;
