const mongoose = require('mongoose');

const logEntrySchema = new mongoose.Schema({
    email: { type: String, required: true }, // 🔹 Store email instead of userId
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // Stores category-specific fields dynamically
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LogEntry', logEntrySchema);
