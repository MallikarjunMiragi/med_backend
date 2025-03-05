const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    fields: [{
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['text', 'date', 'number', 'file'],
            required: true
        }
    }]
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
