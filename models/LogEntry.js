const mongoose = require('mongoose');

const logEntrySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // Stores category-specific fields dynamically
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LogEntry', logEntrySchema);
