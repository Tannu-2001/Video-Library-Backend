import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    admin_id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, unique: true } 
  },
  { timestamps: true }
);

const Admin = mongoose.model("tbladmins", adminSchema);
export default Admin;