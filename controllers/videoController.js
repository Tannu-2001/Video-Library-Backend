import Video from '../models/videoModel.js';
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';

export const removeSavedVideo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { videoId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId))
      return res.status(400).json({ message: "Invalid videoId" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedVideos = user.savedVideos.filter(
      (id) => String(id) !== String(videoId)
    );
    await user.save();

    return res.json({ success: true, message: "Video removed" });
  } catch (err) {
    console.error("removeSavedVideo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const saveVideo = async (req, res) => {
  try {
    const userId = req.user?.id;               // auth middleware must set req.user
    const { videoId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId))
      return res.status(400).json({ message: "Invalid videoId" });

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedVideos = user.savedVideos || [];
    if (!user.savedVideos.map(String).includes(String(videoId))) {
      user.savedVideos.push(videoId);
      await user.save();
    }

    return res.json({ success: true, message: "Video saved" });
  } catch (err) {
    console.error("saveVideo error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getSavedVideos = async (req, res) => {
  try {
    //console.log(">>> getSavedVideos called, headers:", req.headers);
    //console.log(">>> req.user (from auth):", req.user);

    const userId = req.user?.id;
    if (!userId) {
      console.log(">>> No userId in req.user -> return 401");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).populate("savedVideos");
    if (!user) {
      console.log(">>> user not found in DB for id:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    //console.log(">>> user.savedVideos length:", (user.savedVideos || []).length);
    return res.json(user.savedVideos || []);
  } catch (err) {
    console.error("getSavedVideos ERROR:", err);      // <-- important: full stack will print
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};




export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    // basic validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findById(id).lean();
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res.json(video);
  } catch (error) {
    console.error("getVideoById error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getCategoryCollectionName = () => {
  try {
    return (Category && Category.collection && Category.collection.name) || 'categories';
  } catch (e) {
    return 'categories';
  }
};

export const getVideos = async (req, res) => {
  try {
    
    const categoryCollectionName = getCategoryCollectionName();

    // robust aggregate: handle both ObjectId and string-ids (24-hex) for category_id
    const agg = [
      { $addFields: { _origCategoryId: "$category_id" } },
      {
        $lookup: {
          from: categoryCollectionName,
          localField: "category_id",
          foreignField: "_id",
          as: "categoryArr_direct"
        }
      },
      {
        $addFields: {
          maybeObjectId: {
            $cond: [
              {
                $and: [
                  { $ne: [{ $type: "$category_id" }, "objectId"] },
                  { $regexMatch: { input: { $ifNull: ["$category_id", ""] }, regex: /^[0-9a-fA-F]{24}$/ } }
                ]
              },
              { $toObjectId: "$category_id" },
              "$$REMOVE"
            ]
          }
        }
      },
      {
        $lookup: {
          from: categoryCollectionName,
          localField: "maybeObjectId",
          foreignField: "_id",
          as: "categoryArr_objid"
        }
      },
      {
        $addFields: {
          categoryObj: {
            $cond: [
              { $gt: [{ $size: "$categoryArr_direct" }, 0] },
              { $arrayElemAt: ["$categoryArr_direct", 0] },
              {
                $cond: [
                  { $gt: [{ $size: "$categoryArr_objid" }, 0] },
                  { $arrayElemAt: ["$categoryArr_objid", 0] },
                  null
                ]
              }
            ]
          }
        }
      },
      { $addFields: { categoryName: { $ifNull: ["$categoryObj.name", null] } } },
      { $project: { categoryArr_direct: 0, categoryArr_objid: 0, maybeObjectId: 0, categoryObj: 0, _origCategoryId: 0 } },
      { $sort: { createdAt: -1 } }
    ];

    const list = await Video.aggregate(agg);
    return res.json(list);
  } catch (error) {
    console.error("getVideos error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
  
};

export const addVideo = async (req, res) => {
  try {
    console.log("addVideo body:", req.body);
    const { title, description, url, category, category_id, thumbnail } = req.body;

    const catIdRaw = category_id || category || "";
    const catId = typeof catIdRaw === 'string' ? catIdRaw.trim() : String(catIdRaw);

    console.log("resolved catId:", catId);

    if (!title || !description || !url || !catId) {
      return res.status(400).json({ message: "title, description, url and category are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(catId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const categoryDoc = await Category.findById(catId);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Category not found" });
    }

    const created = await Video.create({
      title,
      description,
      url,
      category_id: new mongoose.Types.ObjectId(catId),
      categoryName: categoryDoc.name || "uncategorized",
      thumbnail: thumbnail || ""
    });

    console.log("video created id:", created._id);
    return res.status(201).json({ success: true, message: "Video added", video: created });
  } catch (error) {
    console.error("addVideo error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};


export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    try {
      if (video.thumbnail && video.thumbnail.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), video.thumbnail); // adapt if needed
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      // if you store video files locally use similar removal
    } catch (fileErr) {
      console.warn("Failed to delete associated file:", fileErr);
      // Do not abort deletion if file removal fails
    }

    await Video.findByIdAndDelete(id);

    return res.json({ success: true, message: "Video deleted" });
  } catch (error) {
    console.error("deleteVideo error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};




export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video id" });
    }

    // If category_id is being updated, validate and optionally copy categoryName
    if (req.body.category_id) {
      const newCatId = String(req.body.category_id).trim();
      if (!mongoose.Types.ObjectId.isValid(newCatId)) {
        return res.status(400).json({ message: "Invalid category id" });
      }
      const categoryDoc = await Category.findById(newCatId);
      if (!categoryDoc) return res.status(400).json({ message: "Category not found" });
      req.body.categoryName = categoryDoc.name || req.body.categoryName || "uncategorized";
      req.body.category_id =new mongoose.Types.ObjectId(newCatId);
    }

    const updated = await Video.findByIdAndUpdate(id, req.body, { new: true });
    return res.json({ success: true, video: updated });
  } catch (error) {
    console.error("updateVideo error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export default { getVideos, addVideo, deleteVideo, updateVideo, getVideoById,saveVideo,getSavedVideos };