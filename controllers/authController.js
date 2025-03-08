const User = require('../models/User'); // Adjust the path to your User model

// Signup method
exports.signup = async (req, res) => {
    const { fullName, email, password, country, trainingYear, hospital, specialty, role } = req.body;

    if (!email || !password || !country || !hospital || !specialty || !role) {
        return res.status(400).json({ error: "All fields are required" });
    }

    if (role !== 'student' && role !== 'doctor') {
        return res.status(400).json({ error: "Invalid role. Choose either 'student' or 'doctor'." });
    }

    // Ensure trainingYear is provided for students
    if (role === 'student' && !trainingYear) {
        return res.status(400).json({ error: "Training year is required for students." });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email is already registered" });
        }

        const user = new User({
            fullName,
            email,
            password, // Password should ideally be hashed
            country,
            trainingYear: role === 'student' ? trainingYear : null, // Only store trainingYear for students
            hospital,
            specialty,
            role,
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

    if (!email || !password ) {
        return res.status(400).json({ error: "Email, password, and role are required" });
    }

    try {
        const user = await User.findOne({ email }); // Ensure the user is logging in with the correct role
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.status(200).json({ message: `Login successful as`, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// ✅ Fetch user by email
exports.getUserByEmail = async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
    }
}
// Fetch all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "fullName email role"); // Fetch all users
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getUsersByRole = async (req, res) => {
    const { role } = req.params; // role should be "student" or "doctor"

    if (role !== 'student' && role !== 'doctor') {
        return res.status(400).json({ error: "Invalid role specified" });
    }

    try {
        const users = await User.find({ role }, "fullName email role");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);

        res.status(500).json({ error: "Internal Server Error" });
    }
};



// Update user details
exports.updateUser = async (req, res) => {
    const { email, fullName, password, country, trainingYear, hospital, specialty } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required to update user details" });
    }

    try {
        const updateFields = { fullName, country, trainingYear, hospital, specialty };

        // 🔹 Update password only if provided
        if (password) {
            updateFields.password = password;
        }

        const updatedUser = await User.findOneAndUpdate(
            { email }, 
            updateFields, 
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User details updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Delete user account
exports.deleteUser = async (req, res) => {
    const { email } = req.params; // ✅ Get email from request params

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
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

};




exports.getUserDetailsByEmail = async (req, res) => {
    try {
        const { email } = req.params; // Ensure email is passed
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            fullName: user.fullName,
            email: user.email,
            selectedHospital: user.hospital,
            selectedSpecialty: user.specialty,
            selectedTrainingYear: user.trainingYear,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

