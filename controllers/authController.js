const User = require('../models/User'); // Adjust the path to your User model

// Signup method
exports.signup = async (req, res) => {
    const { fullName, email, password, country, trainingYear, hospital, specialty } = req.body;

    if (!email || !password || !country || !trainingYear || !hospital || !specialty) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email is already registered" });
        }

        const user = new User({
            fullName,  // Updated field
            email,
            password,
            country,
            trainingYear,
            hospital,
            specialty,
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Login method
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    const { email, fullName, country } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required to update user details" });
    }

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email }, 
            { fullName, country }, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User details updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete user account
exports.deleteUser = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required to delete user" });
    }

    try {
        const deletedUser = await User.findOneAndDelete({ email });

        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
