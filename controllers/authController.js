const User = require('../models/User'); // Adjust the path to your User model


exports.signup = async (req, res) => {
    const { email, password, country, trainingYear, hospital, speciality } = req.body;
    if (!email || !password || !country || !trainingYear || !hospital || !speciality) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
      
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: "Email is already registered" });
        }

        const user = new User({
            email,
            password,
            country,
            trainingYear,
            hospital,
            speciality,
        });

        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

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

        res.status(200).json({ message: "Login successful", user: user.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
