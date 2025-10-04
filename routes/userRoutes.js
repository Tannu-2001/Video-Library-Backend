import express from "express";


import {
  registerUser,
  loginUser,
  getRegisterUsers}
from "../controllers/userController.js";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getRegisterUsers);
export default router;