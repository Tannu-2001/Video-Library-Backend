import express from "express";
import auth from "../middleware/auth.js";
import { getVideos, addVideo, deleteVideo, updateVideo, getVideoById, getSavedVideos, saveVideo, removeSavedVideo } from "../controllers/videoController.js";

const router = express.Router();
router.post("/save-video",auth, saveVideo);
router.get("/saved-videos",auth, getSavedVideos);
router.post("/remove-saved-video",auth,removeSavedVideo)
router.get("/", getVideos);
router.post("/", addVideo);
router.get("/:id", getVideoById);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

export default router;