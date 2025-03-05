const Category = require('../models/Category');

// Add new category
exports.addCategory = async (req, res) => {
    const { name, fields } = req.body;

    // Validate that category name and fields are provided and that fields is an array
    if (!name || !fields || !Array.isArray(fields)) {
        return res.status(400).json({ error: "Category name and fields are required" });
    }

    // Validate that every field is an object with a name and type
    const validTypes = ['text', 'date', 'number', 'file'];
    const invalidFields = fields.filter(field => {
        return !field.name || !field.type || !validTypes.includes(field.type);
    });

    if (invalidFields.length > 0) {
        return res.status(400).json({ error: "Each field must have a name and a valid type (text, date, number, file)" });
    }

    try {
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) return res.status(409).json({ error: "Category already exists" });

        // Create and save the new category
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
