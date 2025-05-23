const LogEntry = require("../models/LogEntry");
const Category = require("../models/Category");


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
        // const predefinedFields = {
        //     "Admissions": ["Patient Name", "Admission Date"],
        //     "CPD": ["Activity Name", "Completion Date"],
        //     "POCUS": ["Scan Type", "Result"],
        //     "Procedures": ["Procedure Name", "Outcome"]
        // };

        // ✅ Check if the category is one of the default categories
        // if (predefinedFields[category.name]) {
        //     const requiredFields = predefinedFields[category.name];

        //     // Validate that all required fields are present
        //     const submittedFields = Object.keys(otherFields);
        //     const missingFields = requiredFields.filter(field => !submittedFields.includes(field));

        //     if (missingFields.length > 0) {
        //         return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
        //     }
        // }

        // ✅ Store all dynamic fields including file paths
        const data = { ...otherFields };
        const streamifier = require("streamifier");
        const cloudinary = require("../config/cloudinary");
        
        for (const file of req.files) {
            const fieldName = file.fieldname;
        
            const streamUpload = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'your_folder_name', // optional: change as needed
                            resource_type: 'auto'
                        },
                        (error, result) => {
                            if (result) resolve(result);
                            else reject(error);
                        }
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });
            };
        
            try {
                const result = await streamUpload();
                data[fieldName] = result.secure_url;
            } catch (error) {
                console.error(`❌ Failed to upload ${fieldName} to Cloudinary:`, error);
                return res.status(500).json({ error: `Failed to upload file: ${fieldName}` });
            }
        }
        
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
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.updateEntry = async (req, res) => {
    const { entryId, comments, score } = req.body;

    if (!entryId) {
        return res.status(400).json({ error: "Entry ID is required" });
    }

    if (!comments) {
        return res.status(400).json({ error: "Comments are required" });
    }

    try {
        // Use Gemini API to enhance the comment
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(`Enhance this doctor's comment on student into little descriptive and understandable in a formal way (give only one comment):\n"${comments}"`);
        const enhancedComment = result.response.text();

        // Update entry with enhanced comment
        const updatedEntry = await LogEntry.findByIdAndUpdate(
            entryId,
            { comments: enhancedComment, score },
            { new: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: "Log entry not found" });
        }

        res.status(200).json({ message: "Log entry updated with enhanced comment", updatedEntry });
    } catch (error) {
        console.error("Error updating log entry with Gemini enhancement:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
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

// exports.getAverageScore = async (req, res) => {
//     const { email } = req.params;

//     try {
//         const entries = await LogEntry.find({ email });

//         if (entries.length === 0) {
//             return res.status(404).json({ message: "No log entries found for this email" });
//         }

//         // Calculate the average score
//         const totalScore = entries.reduce((sum, entry) => sum + (entry.score || 0), 0);
//         const averageScore = totalScore / entries.length;

//         res.status(200).json({ averageScore });
//     } catch (error) {
//         console.error("❌ Server error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };
// ✅ Improved getAverageScore function
// exports.getAverageScore = async (req, res) => {
//     const { email } = req.params;

//     try {
//         // ✅ Get all log entries for the student
//         const entries = await LogEntry.find({ email });

//         if (entries.length === 0) {
//             return res.status(404).json({ message: "No log entries found for this email" });
//         }

//         // ✅ Calculate the average score
//         const totalScore = entries.reduce((sum, entry) => sum + (entry.score || 0), 0);
//         const averageScore = (totalScore / entries.length) * 100 / 20;  // Scale to 100 if max score is 20

//         res.status(200).json({ averageScore });
//     } catch (error) {
//         console.error("❌ Server error:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };
exports.getAverageScore = async (req, res) => {
    const { email } = req.params;
   // console.log("Average score request for:", email); // ✅ Add this line
    
    try {
        const entries = await LogEntry.find({ email });
        if (entries.length === 0) {
            return res.status(404).json({ message: "No log entries found for this email" });
        }
        const totalScore = entries.reduce((sum, entry) => sum + (entry.score || 0), 0);
        const averageScore = (totalScore / entries.length) * 100 / 20;
        res.status(200).json({ averageScore });
    } catch (error) {
        console.error("❌ Server error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
