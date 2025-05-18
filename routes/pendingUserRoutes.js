// routes/pendingUserRoutes.js

const express = require("express");
const router = express.Router();
const PendingUser = require("../models/PendingUser");

// Get all pending users
router.get("/pending-users", async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find({ status: "pending" });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch pending users." });
  }
});

// Approve a pending user
router.put("/approve-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pendingUser = await PendingUser.findById(id);

    if (!pendingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Move the user to the main User collection
    const newUser = await User.create({
      fullName: pendingUser.fullName,
      email: pendingUser.email,
      password: pendingUser.password,
      country: pendingUser.country,
      trainingYear: pendingUser.trainingYear,
      hospital: pendingUser.hospital,
      specialty: pendingUser.specialty,
      role: pendingUser.role,
      status: "approved",
      createdAt: new Date(),
    });

    // Delete the user from PendingUser collection
    await PendingUser.findByIdAndDelete(id);

    res.status(200).json({
      message: "User approved successfully.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: "Failed to approve user." });
  }
});


// Reject a pending user
router.put("/reject-user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const rejectedUser = await PendingUser.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!rejectedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(rejectedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reject user." });
  }
});

module.exports = router;
