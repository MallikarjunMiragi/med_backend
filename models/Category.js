// const mongoose = require('mongoose');

// const categorySchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     fields: [{
//         name: {
//             type: String,
//             required: true
//         },
//         type: {
//             type: String,
//             enum: ['text', 'date', 'number', 'file'],
//             required: true
//         }
//     }]
// });

// const Category = mongoose.model('Category', categorySchema);

// module.exports = Category;

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  fields: [
    {
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ["text", "date", "number", "file"],
        required: true,
      },
    },
  ],
  createdBy: { type: String, required: false },
});

// ✅ Add a compound unique index for (name + createdBy)
categorySchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);
