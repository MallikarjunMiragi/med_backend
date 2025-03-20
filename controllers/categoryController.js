const mongoose = require("mongoose");
const Category = require('../models/Category');
exports.checkCategoryExists = async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ error: "Category name is required" });

        const existingCategory = await Category.findOne({ name });
        res.status(200).json({ exists: !!existingCategory });
    } catch (error) {
        console.error("Error checking category existence:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

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


exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        //console.log("Received request to delete category with ID:", id);

        // ✅ Check if the provided ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            //console.error("Invalid ObjectId format:", id);
            return res.status(400).json({ error: "Invalid category ID format" });
        }

        // ✅ Find and delete the category
        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            //console.error("Category not found with ID:", id);
            return res.status(404).json({ error: "Category not found" });
        }

        //console.log("Category deleted successfully:", deletedCategory);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        //console.error("Error deleting category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};