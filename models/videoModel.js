import mongoose, { Schema } from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },

  // store the ObjectId reference (no alias!)
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

  // store a denormalized name if you want quick access (different name to avoid conflict)
  categoryName: { type: String },        // <-- rename from category to categoryName

  thumbnail: { type: String },

}, { timestamps: true });

// If you want to keep a virtual populated category, give it a different name:
videoSchema.virtual("categoryObj", {
  ref: "Category",
  localField: "category_id",
  foreignField: "_id",
  justOne: true
});

export default mongoose.model("Videos", videoSchema);