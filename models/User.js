// models/User.js

const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,  // Ensures email is unique
  },

  password: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
 

  country: {
    type: String,
    required: true,
  },
  trainingYear: {
    type: Number,
    required: true,
  },
  hospital: {
    type: String,
    required: true,
  },
  speciality: {
    type: String,
    required: true,
  },
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
