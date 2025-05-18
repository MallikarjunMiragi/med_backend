const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  otp: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  expiresAt: {
    type: Date,
    required: true,
  },
});

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);

module.exports = OtpVerification;
