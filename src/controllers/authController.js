import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`🔑 Login attempt: ${email}`); // Debug log

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing credentials");
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user (include deleted users? No)
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if deleted
    if (user.isDeleted) {
      console.log(`❌ Deleted user attempted login: ${email}`);
      return res.status(400).json({ message: "Account is deactivated" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`❌ Wrong password for: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    console.log(`✅ Login successful: ${email} (${user.role})`);

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      publicId: user.publicId,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      publicId: `${role === "super-admin" ? "SUP" : role === "admin" ? "ADM" : "USR"}-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        publicId: user.publicId,
      },
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
