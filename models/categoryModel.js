import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  // optional: store list of video ids (if you want reverse relation)
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
}, {collection: "tblcategories", timestamps: true });

export default mongoose.model('Category', CategorySchema);