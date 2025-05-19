import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/usermodel.js";

export const register = async (req, res) => {
    const {
        name,
        email,
        password,
        role, // Changed from userType to role
        semester,
        department,
        section,
        universityRoll,
        classRoll
    } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Name, email and password are required" 
        });
    }

    try {
        // Check for existing user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Email already registered" 
            });
        }

        // Create new user with role mapped to userType
        const user = new userModel({
            name,
            email,
            password, // Password will be hashed by the pre-save middleware
            userType: role, // Map role to userType
            semester,
            department,
            section,
            universityRoll,
            classRoll
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, userType: user.userType }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Send response
        return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType // Send back userType instead of role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Registration failed. Please try again." 
        });
    }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password required" });
  }

  const user = await userModel.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: '1d' });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  });

  user.password = undefined;

  return res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType
    }
  });
};


// Logout user
export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // In production, send this via email
        return res.status(200).json({
            success: true,
            message: "Password reset link generated",
            resetToken
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    // Validate inputs
    if (!email || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            message: "Email and new password are required" 
        });
    }

    // Validate password strength
    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long"
        });
    }

    try {
        // Find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        // Generate new JWT token
        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        return res.status(200).json({ 
            success: true, 
            message: "Password reset successful",
            token
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to reset password. Please try again." 
        });
    }
};
