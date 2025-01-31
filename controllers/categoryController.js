const Category = require('../models/Category');

// Add new category
exports.addCategory = async (req, res) => {
    const { name, fields } = req.body;

    if (!name || !fields || !Array.isArray(fields)) {
        return res.status(400).json({ error: "Category name and fields are required" });
    }

    try {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) return res.status(409).json({ error: "Category already exists" });

        const category = new Category({ name, fields });
        await category.save();
        res.status(201).json({ message: "Category added successfully", category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
