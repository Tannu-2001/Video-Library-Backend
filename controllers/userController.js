
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";


export const registerUser = async (req, res) => {
  try {
    console.log("registerUser body:", req.body);

    const { name, email, password, mobile } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      console.log("register: user already exists:", normalizedEmail);
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name: (name || "").trim() || "NoName",
      email: normalizedEmail,
      password,             
      mobile: mobile || ""
    });

    console.log("User registered:", user._id.toString());
    return res.status(201).json({ message: "Registered", id: user._id, email: user.email });
  } catch (err) {
    console.error("Register error (stack):", err.stack || err);

  
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate key", duplicate: err.keyValue });
    }
    if (err.name === "ValidationError") {
      const errors = Object.keys(err.errors || {}).reduce((acc, k) => {
        acc[k] = err.errors[k].message;
        return acc;
      }, {});
      return res.status(400).json({ message: "Validation failed", errors });
    }

    return res.status(500).json({ message: "Error registering user", error: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    console.log("loginUser body:", req.body);
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    console.log("DB user found:", !!user);

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    console.log("incoming plain:", password);
    console.log("db hash:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("password match:", isMatch);

    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  
   const payload = { id: user._id, role: user.role || "user" };
    const secret = process.env.JWT_SECRET || "dev_secret";
    const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name:user.name, email: user.email, role: user.role || "user" }
    });
  } catch (err) {
    console.error("login error:", err.stack || err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const getRegisterUsers = async (_req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.json(users);
  } catch (err) {
    console.error("getRegisterUsers error:", err);
    return res.status(500).json({ message: "Error fetching users" });
  }
};

export default { registerUser, loginUser, getRegisterUsers };
