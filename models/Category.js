const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Admission, CPD, etc.
    fields: { type: [String], required: true } // Fields like ["date", "age", "gender"]
});

module.exports = mongoose.model('Category', categorySchema);
