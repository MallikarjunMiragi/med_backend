const SupportQuery = require('../models/SupportQuery');

// ✅ Student submits query
exports.submitQuery = async (req, res) => {
  console.log("📥 Incoming payload:", req.body);  // ✅ Log incoming data

  const { email, studentName, supportType, detail } = req.body;

  try {
    const newQuery = new SupportQuery({
      studentEmail: email,  // ✅ Correct field
      studentName,
      supportType,
      detail,
      status: "pending",
    });

    await newQuery.save();
    res.status(201).json({ message: "Query submitted successfully" });
  } catch (error) {
    console.error("❌ Error while saving support query:", error);
    res.status(500).json({ error: "Failed to submit query" });
  }
};

// ✅ New: Admin marks query resolved
exports.resolveQuery = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await SupportQuery.findByIdAndUpdate(id, { status: "resolved" }, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve query" });
  }
};




// ✅ Admin fetches all queries
exports.getAllQueries = async (req, res) => {
  try {
    const queries = await SupportQuery.find().sort({ submittedAt: -1 });  // newest first
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch queries" });
  }
};
