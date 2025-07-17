const bcrypt = require("bcryptjs"); // Only import bcrypt once
const argon2 = require("argon2"); // Import argon2 once
const User = require('../models/User'); 
const PendingUser = require("../models/PendingUser"); 
const UserOtpVerification = require("../models/UserOtpVerification"); 
const { sendEmail } = require("../services/emailService.js");
const jwt = require('jsonwebtoken');  



exports.signup = async (req, res) => {
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

  const {
    fullName,
    email,
    password,
    country,
    trainingYear,
    hospital,
    specialty,
    role
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    // Validate required fields
    if (!fullName || !email || !password || !specialty || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields (fullName, email, password, specialty, role) must be provided."
      });
    }

    // Validate role
    if (role !== "student" && role !== "doctor") {
      return res.status(400).json({ success: false, message: "Invalid role. Choose 'student' or 'doctor'." });
    }

    // Additional validation for student role
    if (role === "student" && (!trainingYear || !country || !hospital)) {
      return res.status(400).json({
        success: false,
        message: "Training year, country, and hospital are required for students."
      });
    }

    // Hash the password and OTP
    const hashedPassword = await argon2.hash(password);
    const hashedOTP = await bcrypt.hash(verificationCode, 10);

    // Prepare PendingUser data
    const pendingUserData = {
      fullName,
      email,
      password: hashedPassword,
      specialty,
      role,
        status: "pending",
    };

    if (role === "student") {
      pendingUserData.country = country;
      pendingUserData.trainingYear = trainingYear;
      pendingUserData.hospital = hospital;
    }

    // Save the user to PendingUser collection
    try {
      const newPendingUser = new PendingUser(pendingUserData);
      await newPendingUser.save();
    } catch (saveErr) {
      console.error("❌ Failed to save PendingUser:", saveErr);
      return res.status(500).json({ success: false, message: "Failed to save user data." });
    }

    // Save OTP separately for email verification
    try {
      const userOtpVerification = new UserOtpVerification({
        email,
        otp: hashedOTP,
        expiresAt: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
      });
      await userOtpVerification.save();
    } catch (otpSaveErr) {
      console.error("❌ Failed to save OTP:", otpSaveErr);
      return res.status(500).json({ success: false, message: "Failed to save OTP." });
    }

    // Send OTP email to the user
    try {
      // 2. Then send welcome email with password
const passwordEmailSent = await sendEmail(
  email,
  "Welcome to Medical LogBook - Your Login Credentials",
  { password }, // pass password in payload
  "sendPassword" // new template you'll define
);

} catch (emailErr) {
      console.error("❌ Failed to send OTP email:", emailErr);
      return res.status(200).json({ message: "User registered successfully." });
    }

    // Send success response
    res.status(200).json({ success: true, message: "OTP sent. Please verify your email." });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('Received email:', email);
  console.log('Received password:', password);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
        // ✅ Direct login for admin
    if (email === "admin@logbook.com" && password === "admin1") {
      return res.status(200).json({
        message: "Admin login successful",
       role: "admin",
        user: { email: "admin@logbook.com", role: "admin" }
      });
    }

        const pendingUser = await PendingUser.findOne({ email: req.body.email });
    if (pendingUser) {
      return res.status(403).json({ error: "Account pending approval" });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

        if (user.status === "pending") {
      return res.status(403).json({ error: "Account pending approval" });
    }
    
    const isMatch = await argon2.verify(user.password, password); // 👈 using argon2.verify here!
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.status(200).json({ 
      message: "Login successful", 
      role: user.role, 
      user 
    });

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

// Fetch all approved students (exclude doctors)
exports.getAllUsers = async (req, res) => {
  try {
    const { specialty } = req.query;
 // GET /api/auth/users/all
const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // exclude password
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

module.exports = { getAllUsers };

    // ✅ Only include approved students
    let query = { role: "student", status: "approved" };

    // ✅ Apply specialty filter if present
    if (specialty) {
      query.specialty = specialty;
    }

    const users = await User.find(query, "fullName email role specialty");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.getUsersByRole = async (req, res) => {
    const { role } = req.params;
    const specialtyFilter = req.query.specialty; // ✅ Get specialty filter from query params

    if (role !== "student" && role !== "doctor") {
        return res.status(400).json({ error: "Invalid role specified" });
    }

    try {
        let query = { role: "student" }; // ✅ Only fetch students
        if (specialtyFilter) {
            query.specialty = specialtyFilter; // ✅ Filter by specialty
        }

        const users = await User.find(query, "fullName email role specialty");
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.getAllRegisteredUsers = async (req, res) => {
    try {
        const users = await User.find({}, "fullName email role specialty status country trainingYear hospital");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// Update user details
exports.updateUser = async (req, res) => {
    const { originalEmail, email, fullName, password, country, trainingYear, hospital, specialty } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email is required to update user details" });
    }

    try {
        const updateFields = { fullName, email, country, trainingYear, hospital, specialty };

        // 🔹 Update password only if provided
        if (password) {
            updateFields.password = password;
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: originalEmail }, 
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

// exports.updateUserStatus = async (req, res) => {
//     const { email, status } = req.body;
  
//     if (!email || !status) {
//       return res.status(400).json({ error: "Email and status are required." });
//     }
  
//     try {
//       const user = await User.findOneAndUpdate(
//         { email },
//         { status },
//         { new: true }
//       );
  
//       if (!user) {
//         return res.status(404).json({ error: "User not found." });
//       }
  
//       res.status(200).json({ message: `User status updated to ${status}` });
//     } catch (error) {
//       console.error("Error updating user status:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     }
//   };
  
  // Backend - update user role
// Route: PUT /api/auth/user/update-role
exports.updateUserRole = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required." });
  }

  try {
    const user = await User.findOneAndUpdate({ email }, { role }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Role updated successfully", user });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: "Server error" });
  }
};



// exports.updateUserStatus = async (req, res) => {
//   const { email, status } = req.body;

//   if (!email || !status) {
//     return res.status(400).json({ error: "Email and status are required." });
//   }

//   try {
//     const user = await User.findOneAndUpdate(
//       { email },
//       { status },
//       { new: true }
//     );

//     if (!user) {
//       return res.status(404).json({ error: "User not found." });
//     }

//     // ✅ If status is rejected, move user to PendingUser and delete from User
//     if (status === 'rejected') {
//       // Create a new pending user with the same data
//       const { _id, ...userData } = user.toObject(); // remove _id
//         userData.otpVerified = true;
//       await PendingUser.create(userData); // insert into pendingUsers

//       await User.deleteOne({ email }); // remove from users collection
//     }

//     res.status(200).json({ message: `User status updated to ${status}` });
//   } catch (error) {
//     console.error("Error updating user status:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


exports.updateUserStatus = async (req, res) => {
  const { email, status } = req.body;
console.log("Incoming body for updateUserStatus:", req.body);
  if (!email || !status) {
    return res.status(400).json({ error: "Email and status are required." });
  }

  const mappedStatus = status === "enabled" ? "approved"
                    : status === "disabled" ? "rejected"
                    : null;

  if (!mappedStatus) {
    return res.status(400).json({ error: "Invalid status value." });
  }

  try {
    let user = await User.findOne({ email });
    let pendingUser = await PendingUser.findOne({ email });

    if (mappedStatus === "rejected") {
      if (user) {
        const newPending = new PendingUser({ ...user.toObject(), status: 'rejected' });
        await newPending.save();
        await User.deleteOne({ email });
        return res.status(200).json({ message: "User disabled and moved to PendingUser." });
      }

      if (pendingUser) {
        pendingUser.status = 'rejected';
        await pendingUser.save();
        return res.status(200).json({ message: "Pending user status updated to rejected." });
      }

      return res.status(404).json({ error: "User not found in either collection." });
    }

    if (mappedStatus === "approved") {
      if (user) {
        user.status = 'approved';
        await user.save();
        return res.status(200).json({ message: "User enabled." });
      }

      if (pendingUser) {
        const newUser = new User({ ...pendingUser.toObject(), status: 'approved' });
        delete newUser._id;
        await newUser.save();
        await PendingUser.deleteOne({ email });
        return res.status(200).json({ message: "Pending user enabled and moved to Users." });
      }

      return res.status(404).json({ error: "User not found in either collection." });
    }

    return res.status(400).json({ error: "Invalid status update." });
  } catch (err) {
    console.error("Error updating user status:", err);
    return res.status(500).json({ error: "Server error while updating user status." });
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


// exports.verifyOTP = async (req, res) => {
//     const { email, otp } = req.body;
//     console.log("Incoming verifyOTP request body:", req.body);
  
//     try {
//       const otpRecord = await UserOtpVerification.findOne({ email });
//       if (!otpRecord) {
//         return res.status(400).json({ success: false, message: "No pending verification found." });
//       }
  
//       if (otpRecord.expiresAt < Date.now()) {
//         await UserOtpVerification.updateOne({ email }, { $unset: { otp: "" } });
//         return res.status(400).json({ success: false, message: "OTP expired. Request a new one." });
//       }
  
//       const validOtp = await bcrypt.compare(otp, otpRecord.otp);
//       if (!validOtp) {
//         return res.status(400).json({ success: false, message: "Invalid OTP. Try again." });
//       }
  
//       const pendingUser = await PendingUser.findOne({ email });
//       if (!pendingUser) {
//         return res.status(400).json({ success: false, message: "User data not found." });
//       }
  
//       const newUserData = {
//         fullName: pendingUser.fullName || pendingUser.name || "",
//         email: pendingUser.email,
//         password: pendingUser.password,
//         role: pendingUser.role || "student",
//         specialty: pendingUser.specialty || "",
//         hospital: pendingUser.hospital || "",
//         country: pendingUser.country || "",
//         trainingYear: pendingUser.trainingYear || "",
//         isVerified: true,
//         createdAt: new Date(),
//       };
  
//       const newUser = await User.create(newUserData);
  
//       await UserOtpVerification.deleteMany({ email });
//       await PendingUser.deleteMany({ email });
  
//       return res.json({ success: true, message: "User verified and registered successfully.", user: newUser });
//     } catch (error) {
//       console.error("❌ Error verifying OTP:", error.stack || error);
//       return res.status(500).json({ success: false, message: error.message || "Server Error" });
//     }
//   };

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  console.log("Incoming verifyOTP request body:", req.body);

  try {
    const otpRecord = await UserOtpVerification.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "No pending verification found." });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await UserOtpVerification.updateOne({ email }, { $unset: { otp: "" } });
      return res.status(400).json({ success: false, message: "OTP expired. Request a new one." });
    }

    const validOtp = await bcrypt.compare(otp, otpRecord.otp);
    if (!validOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Try again." });
    }

    // ✅ Mark OTP as verified in pending user
    await PendingUser.updateOne({ email }, { $set: { otpVerified: true } });

    const pendingUser = await PendingUser.findOne({ email });
    if (!pendingUser) {
      return res.status(400).json({ success: false, message: "User data not found." });
    }

    // ✅ Only proceed if status is approved AND otpVerified is true
    if (pendingUser.status !== "approved") {
      return res.status(200).json({
        success: true,
        message: "OTP verified. Awaiting admin approval.",
      });
    }

    if (!pendingUser.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "OTP not verified yet.",
      });
    }

    // ✅ Move to User collection
    const newUserData = {
      fullName: pendingUser.fullName || pendingUser.name || "",
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role || "student",
      specialty: pendingUser.specialty || "",
      hospital: pendingUser.hospital || "",
      country: pendingUser.country || "",
      trainingYear: pendingUser.trainingYear || "",
      isVerified: true,
      createdAt: new Date(),
    };

    const newUser = await User.create(newUserData);

    await UserOtpVerification.deleteMany({ email });
    await PendingUser.deleteMany({ email });

    return res.json({ success: true, message: "User verified and registered successfully.", user: newUser });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error.stack || error);
    return res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

  exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // Create JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "8h",
      });
  
      // Use CLIENT_URL from environment variables
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${user._id}/${token}`;
  
      const emailSent = await sendEmail(
        email,
        "Reset Your Password - Medical-LogBook",
        resetLink,
        "resetPassword"
      );
  
      if (!emailSent) {
        return res.status(500).json({ success: false, message: "Error sending reset email." });
      }
  
      res.json({ success: true, message: "Reset email sent." });
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  };
  
  exports.resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
  
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Check if the decoded token's id matches the user id in the URL
      if (!decoded || decoded.id !== id) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token.",
        });
      }
  
      // Find the user
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
  
      // Hash new password
      const hashedPassword = await argon2.hash(password);
  
      // Update user's password
      user.password = hashedPassword;
      await user.save();
  
      res.json({
        success: true,
        message: "Password updated successfully.",
      });
    } catch (error) {
      console.error("Error resetting password:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to reset password. Token may have expired or is invalid.",
      });
    }
  };

  
  
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find({ otpVerified: true, status: "pending" });
    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};

exports.getAllPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find(); // fetch all documents
    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching all pending users:", error);
    res.status(500).json({ message: "Failed to fetch pending users" });
  }
};

exports.approvePendingUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  try {
    // Find the user in PendingUser collection
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({ error: "Pending user not found." });
    }

    // Create new User document with status "approved"
    const newUser = new User({
      ...pendingUser.toObject(), // copy all fields
      status: "approved",
      _id: undefined, // Remove _id to let MongoDB generate a new one
    });

    // Save the new user
    await newUser.save();

    // Remove from PendingUser collection
    await PendingUser.deleteOne({ email });

    return res.status(200).json({ message: "User approved successfully." });
  } catch (error) {
    console.error("Error approving pending user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};