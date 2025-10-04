import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = { id: user._id };
    next();
  } catch (err) {
    console.error("auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;