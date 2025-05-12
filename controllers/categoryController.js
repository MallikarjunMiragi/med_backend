// const mongoose = require("mongoose");
// const Category = require('../models/Category');
// exports.checkCategoryExists = async (req, res) => {
//     try {
//         const { name } = req.query;
//         if (!name) return res.status(400).json({ error: "Category name is required" });

//         const existingCategory = await Category.findOne({ name });
//         res.status(200).json({ exists: !!existingCategory });
//     } catch (error) {
//         console.error("Error checking category existence:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// // Add new category
// exports.addCategory = async (req, res) => {
//     const { name, fields } = req.body;

//     // Validate that category name and fields are provided and that fields is an array
//     if (!name || !fields || !Array.isArray(fields)) {
//         return res.status(400).json({ error: "Category name and fields are required" });
//     }

//     // Validate that every field is an object with a name and type
//     const validTypes = ['text', 'date', 'number', 'file'];
//     const invalidFields = fields.filter(field => {
//         return !field.name || !field.type || !validTypes.includes(field.type);
//     });

//     if (invalidFields.length > 0) {
//         return res.status(400).json({ error: "Each field must have a name and a valid type (text, date, number, file)" });
//     }

//     try {
//         const existingCategory = await Category.findOne({ name });
//         if (existingCategory) return res.status(409).json({ error: "Category already exists" });

//         // Create and save the new category
//         const category = new Category({ name, fields });
//         await category.save();
//         res.status(201).json({ message: "Category added successfully", category });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// // Get all categories
// // Get all categories (Ensure default ones exist)

// exports.getCategories = async (req, res) => {
//     try {
//         // Fetch dynamic categories from MongoDB with `_id` included
//         const dynamicCategories = await Category.find({}, "_id name fields");

//         // Default categories
//         const defaultCategories = [
//             { name: "Admissions", fields: [{ name: "Patient Name", type: "text" }, { name: "Admission Date", type: "date" }] },
//             { name: "CPD", fields: [{ name: "Activity Name", type: "text" }, { name: "Completion Date", type: "date" }] },
//             { name: "POCUS", fields: [{ name: "Scan Type", type: "text" }, { name: "Result", type: "text" }] },
//             { name: "Procedures", fields: [{ name: "Procedure Name", type: "text" }, { name: "Outcome", type: "text" }] }
//         ];

//         // Insert missing default categories into MongoDB
//         for (const defaultCat of defaultCategories) {
//             const existingCategory = await Category.findOne({ name: defaultCat.name });
//             if (!existingCategory) {
//                 const newCategory = await Category.create(defaultCat);
//                 defaultCat._id = newCategory._id; // Store `_id` after creation
//             } else {
//                 defaultCat._id = existingCategory._id;
//             }
//         }

//         // Filter out duplicates
//         const filteredDynamicCategories = dynamicCategories.filter(
//             (cat) => !defaultCategories.some((defaultCat) => defaultCat.name === cat.name)
//         );

//         // Convert default categories to **mutable objects** before merging
//         const mutableDefaultCategories = defaultCategories.map((cat) => ({ ...cat }));

//         // Merge categories and return
//         const allCategories = [...mutableDefaultCategories, ...filteredDynamicCategories];

//         res.status(200).json(allCategories);
//     } catch (error) {
//         console.error("Error fetching categories:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };




// const getAllCategories = async (req, res) => {
//     try {
//         const categories = await Category.find({}, "_id name fields"); // ✅ Ensure _id is included
//         res.json(categories);
//     } catch (error) {
//         res.status(500).json({ error: "Failed to fetch categories" });
//     }
// };




// exports.deleteCategory = async (req, res) => {
//     try {
//         const { id } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ error: "Invalid category ID format" });
//         }

//         const category = await Category.findById(id);
//         if (!category) {
//             return res.status(404).json({ error: "Category not found" });
//         }

//         // Prevent deletion of default categories
//         const defaultCategories = ["Admissions", "CPD", "POCUS", "Procedures"];
//         if (defaultCategories.includes(category.name)) {
//             return res.status(403).json({ error: "Cannot delete default categories" });
//         }

//         await Category.findByIdAndDelete(id);
//         res.status(200).json({ message: "Category deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

const mongoose = require("mongoose");
const Category = require('../models/Category');
exports.checkCategoryExists = async (req, res) => {
    try {
        const { name, email } = req.query;
        if (!name || !email) {
            return res.status(400).json({ error: "Category name and email are required" });
        }

        // Check only for this user's category
        const existingCategory = await Category.findOne({ name, createdBy: email });
        res.status(200).json({ exists: !!existingCategory });
    } catch (error) {
        console.error("Error checking category existence:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Add new category
exports.addCategory = async (req, res) => {
    const { name, fields, createdBy } = req.body;

    if (!name || !fields || !Array.isArray(fields)) {
        return res.status(400).json({ error: "Category name and fields are required" });
    }

    const validTypes = ['text', 'date', 'number', 'file'];
    const invalidFields = fields.filter(field => {
        return !field.name || !field.type || !validTypes.includes(field.type);
    });

    if (invalidFields.length > 0) {
        return res.status(400).json({ error: "Each field must have a name and a valid type (text, date, number, file)" });
    }

    try {
        const existingCategory = await Category.findOne({ name, createdBy });
        if (existingCategory) return res.status(409).json({ error: "Category already exists" });

        const category = new Category({ name, fields, createdBy });
        await category.save();
        res.status(201).json({ message: "Category added successfully", category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




exports.getCategories = async (req, res) => {
    try {
      const rawEmail = req.query.email || "";
      const email = rawEmail.trim().toLowerCase();
  
      //console.log("📩 Email received for category fetch:", email);
  
      let dynamicCategories = [];
  
      if (email) {
        // Match email exactly (case-insensitive)
        dynamicCategories = await Category.find(
          { createdBy: { $regex: `^${email}$`, $options: "i" } },
          "_id name fields createdBy"
        );
      }
  
      // Default categories
      const defaultCategories = [
 {
    name: "Admissions",
    fields: [
      { name: "Patient Name", type: "text" },
      { name: "Admission Date", type: "date" },
      { name: "Date", type: "date" },
      { name: "Hospital", type: "text" },
      { name: "Location", type: "text" },
      { name: "Referral Source", type: "text" },
      { name: "Your Reference", type: "text" },
      { name: "Gender", type: "text" },
      { name: "Age", type: "number" },
      { name: "Role", type: "text" },
      { name: "Specialty Area", type: "text" },
      { name: "Problem", type: "text" },
      { name: "Outcome", type: "text" },
      { name: "Notes", type: "textarea" },
      { name: "Attachments", type: "file" },
    ],
  },
{
  name: "CPD",
  fields: [
    { name: "Date", type: "date" },
    { name: "End Date", type: "date" },
    { name: "Type of CPD Activity", type: "text" },
    { name: "Title", type: "text" },
    { name: "Note", type: "textarea" },
    { name: "Attachment", type: "file" },
  ],
},

{
  name: "POCUS",
  fields: [
    { name: "Date", type: "date" },
    { name: "Site/Type", type: "text" },
    { name: "Your Reference", type: "text" },
    { name: "Supervision", type: "text" },
    { name: "Patient Gender", type: "text" },
    { name: "Age", type: "number" },
    { name: "Findings", type: "textarea" },
    { name: "Note", type: "textarea" },
    { name: "Attachment", type: "file" },
  ],
},
{
  name: "Procedures",
  fields: [
    { name: "Date", type: "date" },
    { name: "Procedure", type: "text" },
    { name: "Hospital", type: "text" },
    { name: "Supervision", type: "text" },
    { name: "Supervisor", type: "text" },
    { name: "Your Reference", type: "text" },
    { name: "Gender", type: "text" },
    { name: "Age", type: "number" },
    { name: "Follow-up Notes", type: "textarea" },
    { name: "Complications", type: "textarea" },
    { name: "Notes", type: "textarea" },
    { name: "Attachments", type: "file" },
  ],
},

      ];
  
      // Insert missing defaults (only once)
      for (const defaultCat of defaultCategories) {
        const exists = await Category.findOne({ name: defaultCat.name });
        if (!exists) {
          const created = await Category.create(defaultCat);
          defaultCat._id = created._id;
        } else {
          defaultCat._id = exists._id;
        }
      }
  
      // Filter duplicates by name
      const filtered = dynamicCategories.filter(
        (cat) => !defaultCategories.some((d) => d.name === cat.name)
      );
  
      const allCategories = [...defaultCategories, ...filtered];
      //console.log(`✅ Total categories returned: ${allCategories.length}`);
      res.status(200).json(allCategories);
    } catch (error) {
      //console.error("❌ Error fetching categories:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({}, "_id name fields"); // ✅ Ensure _id is included
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
};




exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid category ID format" });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        // Prevent deletion of default categories
        const defaultCategories = ["Admissions", "CPD", "POCUS", "Procedures"];
        if (defaultCategories.includes(category.name)) {
            return res.status(403).json({ error: "Cannot delete default categories" });
        }

        await Category.findByIdAndDelete(id);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
