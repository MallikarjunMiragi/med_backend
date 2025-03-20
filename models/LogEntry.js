const mongoose = require("mongoose");

const logEntrySchema = new mongoose.Schema({
    email: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },  // ✅ Keep ObjectId for querying
    categoryName: { type: String, required: true },  // ✅ Store the name as well
    //data: { type: Object, required: true },
    data: {
        name: String,
        file: String, // ✅ Store file path
    },
    
    comments: { type: String, default: "" },  // ✅ Add comments field
    score: { type: Number, default: null },   // ✅ Add score field
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LogEntry", logEntrySchema);
