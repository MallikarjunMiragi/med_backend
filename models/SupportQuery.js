const mongoose = require('mongoose');

const SupportQuerySchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  studentName: { type: String, required: true },
  supportType: { type: String, required: true },  // ✅ Added
  detail: { type: String, required: true },       // ✅ Added
  status: { type: String, default: "pending" },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportQuery', SupportQuerySchema);
