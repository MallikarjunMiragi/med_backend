const LogEntry = require("../models/LogEntry");
const Category = require("../models/Category");

// Add log entry to a category
exports.addEntry = async (req, res) => {
    const { email, categoryId, data } = req.body;

    console.log("🔹 Received request:", req.body);

    if (!email || !categoryId || !data) {
        console.error("❌ Missing required fields:", { email, categoryId, data });
        return res.status(400).json({ error: "Email, categoryId, and data are required" });
    }

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            console.error("❌ Category not found:", categoryId);
            return res.status(404).json({ error: "Category not found" });
        }

        // ✅ Save log entry with both categoryId and categoryName
        const newEntry = new LogEntry({
            email,
            categoryId: category._id,  // ✅ Store as ObjectId
            categoryName: category.name,  // ✅ Store category name separately
            data,
        });

        await newEntry.save();

        console.log("✅ Log entry saved:", newEntry);
        res.status(201).json({ message: "Log entry added successfully", newEntry });
    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Get logbook entries for a user
exports.getEntries = async (req, res) => {
    const { email } = req.params;

    try {
        console.log("🔹 Fetching entries for:", email);

        const entries = await LogEntry.find({ email });

        // ✅ Return categoryName instead of categoryId
        const formattedEntries = entries.map(entry => ({
            _id: entry._id,
            email: entry.email,
            category: entry.categoryName,  // ✅ Now category name is included
            data: entry.data,
            createdAt: entry.createdAt,
        }));

        res.status(200).json(formattedEntries);
    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

