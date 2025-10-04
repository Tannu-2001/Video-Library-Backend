import Admin from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ✅ Get all admins
 export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins", error: error.message });
  }
};

// ✅ Create new admin (now hashes password)
export const createAdmin = async (req, res) => {
  try {
    const { admin_id, password } = req.body;

    if (!admin_id || !password) {
      return res.status(400).json({ message: "Admin ID and password are required" });
    }

    const existingAdmin = await Admin.findOne({ admin_id });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({ admin_id, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully", admin: { admin_id: newAdmin.admin_id, _id: newAdmin._id } });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error: error.message });
  }
};

// ✅ Get admin by ID (uses Mongo _id)
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin", error: error.message });
  }
};

// ✅ Update admin (by Mongo _id)
export const updateAdmin = async (req, res) => {
  try {
    const { admin_id, password } = req.body;

    const updateFields = { admin_id };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error updating admin", error: error.message });
  }
};

// ✅ Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);

    if (!deletedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
};

// ✅ Admin Login (fixed to lookup by admin_id and use bcrypt)
export const loginAdmin = async (req, res) => {
  try {
    // accept either admin_id or adminId from client
    const admin_id = req.body.admin_id || req.body.adminId;
    const password = req.body.password;

    if (!admin_id || !password) {
      return res.status(400).json({ message: "admin_id and password required" });
    }

    // IMPORTANT: find by admin_id (string), not by _id
    console.log("Attempting admin login for:", admin_id);
    const admin = await Admin.findOne({ admin_id: admin_id });
    if (!admin) {
      console.log("Admin not found for admin_id:", admin_id);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare hashed password
  const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log("Password mismatch for admin_id:", admin_id);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT
    const secret = process.env.JWT_SECRET || "changeme";
    const token = jwt.sign({ id: admin._id, admin_id: admin.admin_id }, secret, {
      expiresIn: "1d",
    });

    console.log("Admin login successful:", admin_id);
    res.json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default  {
  getAdmins,
  createAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
};