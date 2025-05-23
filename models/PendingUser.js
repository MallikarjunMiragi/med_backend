// const mongoose = require("mongoose");

// const pendingUserSchema = new mongoose.Schema({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   country: { type: String },
//   trainingYear: { type: String },
//   hospital: { type: String },
//   specialty: { type: String, required: true },
//   role: { type: String, enum: ["student", "doctor"], required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("PendingUser", pendingUserSchema);
// models/PendingUser.js

const mongoose = require("mongoose");

const pendingUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String },
  trainingYear: { type: String },
  hospital: { type: String },
  specialty: { type: String, required: true },
  role: { type: String, enum: ["student", "doctor"], required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  otpVerified: {
  type: Boolean,
  default: false,
}
,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PendingUser", pendingUserSchema);
