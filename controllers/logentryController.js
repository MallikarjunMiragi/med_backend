const LogEntry = require('../models/LogEntry');
const Category = require('../models/Category');

// Add log entry to a category
exports.addEntry = async (req, res) => {
    const { userId, categoryId, data } = req.body;

    if (!userId || !categoryId || !data) {
        return res.status(400).json({ error: "User, category, and data are required" });
    }

    try {
        const category = await Category.findById(categoryId);
        if (!category) return res.status(404).json({ error: "Category not found" });

        // Ensure data contains all required fields
        const missingFields = category.fields.filter(field => !(field in data));
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
        }

        const newEntry = new LogEntry({ user: userId, category: categoryId, data });
        await newEntry.save();
        res.status(201).json({ message: "Log entry added successfully", newEntry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get logbook entries for a user
exports.getEntries = async (req, res) => {
    const { userId } = req.params;

    try {
        const entries = await LogEntry.find({ user: userId }).populate('category');
        res.status(200).json(entries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
