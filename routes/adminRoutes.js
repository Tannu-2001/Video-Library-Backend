import express from "express";

  import {
  getAdmins,
  createAdmin,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

// Routes
router.get("/", getAdmins);           // GET all admins
router.post("/", createAdmin);        // Create admin
router.get("/:id", getAdminById);     // Get single admin by ID
router.put("/:id", updateAdmin);      // Update admin
router.delete("/:id", deleteAdmin);   // Delete admin
router.post("/login", loginAdmin);    // Login admin

export default router;