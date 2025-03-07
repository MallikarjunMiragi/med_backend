const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Adjust the path

// Routes for signup and login
router.post('/signup', authController.signup);
router.post('/login', authController.login);
// Add this route to fetch all users
// router.get('/users', authController.getAllUsers);
router.get('/users/:role', authController.getUsersByRole); 

router.get('/users', authController.getAllUsers);


router.get("/user/:email", authController.getUserByEmail);
router.put("/user/update", authController.updateUser);
router.delete("/user/delete/:email", authController.deleteUser);


module.exports = router;
