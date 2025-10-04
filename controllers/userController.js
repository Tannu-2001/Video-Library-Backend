import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

// =============================
// REGISTER USER
// =============================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ No manual hashing (handled by model pre-save)
    const user = await User.create({
      name: (name || "").trim() || "NoName",
      email: normalizedEmail,
      password: password.trim(),
      mobile: mobile || "",
      role: "user"
    });

    // ✅ Success response
    return res.status(201).json({
      message: "User registered successfully",
      id: user._id,
      email: user.email
    });

  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({
      message: "Error registering user",
      error: err.message
    });
  }
};

// =============================
// LOGIN USER
// =============================
export const loginUser = async (req, res) => {
  try {
    const email = (req.body?.email || "").toLowerCase().trim();
    const password = (req.body?.password || "").toString();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT Token
    const payload = { id: user._id, role: user.role || "user" };
    const secret = process.env.JWT_SECRET || "dev_secret";
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });


    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user"
      }
    });

  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
};

// =============================
// GET ALL REGISTERED USERS
// =============================
export const getRegisterUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    console.error("Get users error:", err.message);
    return res.status(500).json({ message: "Error fetching users" });
  }
};

export default { registerUser, loginUser, getRegisterUsers };