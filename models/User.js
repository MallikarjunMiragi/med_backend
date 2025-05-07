// models/User.js

const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,  // Ensures email is unique
  },

  password: {
    type: String,
    required: true,
  },

  country: { type: String, required: function() { return this.role === 'student'; } },
  trainingYear: { type: String, required: function() { return this.role === 'student'; } },
  hospital: { type: String, required: function() { return this.role === 'student'; } },
  
  specialty: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'doctor'], // Role should be either student or doctor
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
