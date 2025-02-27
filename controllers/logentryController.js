const LogEntry = require('../models/LogEntry');
const Category = require('../models/Category');

// Add log entry to a category
exports.addEntry = async (req, res) => {
    const { email, categoryId, data } = req.body; // 🔹 Use email instead of userId

    if (!email || !categoryId || !data) {
        return res.status(400).json({ error: "Email, category, and data are required" });
    }

    try {
        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ error: "Category not found" });

        // Ensure data contains all required fields
        const missingFields = category.fields.filter(field => !(field in data));
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
        }

        // 🔹 Store email instead of userId in the log entry
        const newEntry = new LogEntry({ email, category: categoryId, data });
        await newEntry.save();
        res.status(201).json({ message: "Log entry added successfully", newEntry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get logbook entries for a user
exports.getEntries = async (req, res) => {
    const { email } = req.params; // 🔹 Fetch entries using email instead of userId

    try {
        const entries = await LogEntry.find({ email }).populate('category');
        res.status(200).json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
