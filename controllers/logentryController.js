const LogEntry = require("../models/LogEntry");
const Category = require("../models/Category");

// Add log entry to a category
// exports.addEntry = async (req, res) => {
//     //console.log("🔹 Received request:", JSON.stringify(req.body, null, 2));
//     //console.log("🔹 Uploaded file:", req.file);

//     const { email, categoryId, ...otherFields } = req.body;
//     const files = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : []; // ✅ Handle multiple files
    

//     if (!email || !categoryId) {
//         //console.error("❌ Missing required fields:", { email, categoryId });
//         return res.status(400).json({ error: "Email and categoryId are required" });
//     }

//     try {
//         const category = await Category.findById(categoryId);
//         if (!category) {
//             //console.error("❌ Category not found:", categoryId);
//             return res.status(404).json({ error: "Category not found" });
//         }

//         // ✅ Store all dynamic fields including files
//         const data = { ...otherFields };
//         req.files.forEach((file) => {
//             const fieldName = file.fieldname; // ✅ Get the field name from the file
//             data[fieldName] = `/uploads/${file.filename}`; // ✅ Store it properly
//         });
        

//         const newEntry = new LogEntry({
//             email,
//             categoryId: category._id,
//             categoryName: category.name,
//             data, // ✅ Store all dynamic fields
//         });

//         await newEntry.save();
//         //console.log("✅ Log entry saved:", newEntry);
//         res.status(201).json({ message: "Log entry added successfully", newEntry });
//     } catch (error) {
//         //console.error("❌ Server error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };


exports.addEntry = async (req, res) => {
    //console.log("🔹 Received request:", JSON.stringify(req.body, null, 2));
    //console.log("🔹 Uploaded file:", req.file);

    const { email, categoryId, ...otherFields } = req.body;
    const files = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : []; // ✅ Handle multiple files

    if (!email || !categoryId) {
        //console.error("❌ Missing required fields:", { email, categoryId });
        return res.status(400).json({ error: "Email and categoryId are required" });
    }

    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            //console.error("❌ Category not found:", categoryId);
            return res.status(404).json({ error: "Category not found" });
        }

        // ✅ Predefined fields for default categories
        const predefinedFields = {
            "Admissions": ["Patient Name", "Admission Date"],
            "CPD": ["Activity Name", "Completion Date"],
            "POCUS": ["Scan Type", "Result"],
            "Procedures": ["Procedure Name", "Outcome"]
        };

        // ✅ Check if the category is one of the default categories
        if (predefinedFields[category.name]) {
            const requiredFields = predefinedFields[category.name];

            // Validate that all required fields are present
            const submittedFields = Object.keys(otherFields);
            const missingFields = requiredFields.filter(field => !submittedFields.includes(field));

            if (missingFields.length > 0) {
                return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
            }
        }

        // ✅ Store all dynamic fields including file paths
        const data = { ...otherFields };
        req.files.forEach((file) => {
            const fieldName = file.fieldname; // ✅ Get the field name from the file
            data[fieldName] = `/uploads/${file.filename}`; // ✅ Store it properly
        });

        const newEntry = new LogEntry({
            email,
            categoryId: category._id,
            categoryName: category.name,
            data, // ✅ Store all dynamic fields
        });

        await newEntry.save();
        //console.log("✅ Log entry saved:", newEntry);
        res.status(201).json({ message: "Log entry added successfully", newEntry });
    } catch (error) {
        //console.error("❌ Server error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Get logbook entries for a user
exports.getEntries = async (req, res) => {
    const { email } = req.params;

    try {
        // console.log("🔹 Fetching entries for:", email);

        const entries = await LogEntry.find({ email });

        // ✅ Return categoryName instead of categoryId
        const formattedEntries = entries.map(entry => ({
            _id: entry._id,
            email: entry.email,
            category: entry.categoryName,  // ✅ Now category name is included
            data: entry.data,
            comments: entry.comments || "",  // ✅ Include comments (if any)
            score: entry.score !== undefined ? entry.score : null,  // ✅ Include score (if any)
            createdAt: entry.createdAt,
        }));

        res.status(200).json(formattedEntries);
    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Add new API to update comments & score for a log entry
exports.updateEntry = async (req, res) => {
    const { entryId, comments, score } = req.body;

    if (!entryId) {
        return res.status(400).json({ error: "Entry ID is required" });
    }

    try {
        const updatedEntry = await LogEntry.findByIdAndUpdate(
            entryId,
            { comments, score },
            { new: true }  // Return updated document
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: "Log entry not found" });
        }

        res.status(200).json({ message: "Log entry updated", updatedEntry });
    } catch (error) {
        console.error("Error updating log entry:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.getEntriesByReviewStatus = async (req, res) => {
    const { email } = req.params;

    try {
        const entries = await LogEntry.find({ email });

        // ✅ Separate reviewed & not reviewed
        const reviewedEntries = [];
        const notReviewedEntries = [];

        entries.forEach(entry => {
            if (entry.comments && entry.score !== null) {
                reviewedEntries.push(entry);
            } else {
                notReviewedEntries.push(entry);
            }
        });

        res.status(200).json({
            reviewed: reviewedEntries,
            notReviewed: notReviewedEntries,
        });
    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
