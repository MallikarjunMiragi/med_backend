const express = require("express");
const router = express.Router();
const User = require("../models/User");

// ✅ Route: GET /api/students
router.get("/", async (req, res) => {
  try {
    const students = await User.find(
      { role: "student", status: "approved" },
      "fullName email"
    );
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Server error while fetching students" });
  }
});

module.exports = router;
