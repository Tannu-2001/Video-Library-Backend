import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false }, // IMPORTANT
    mobile: { type: String },
    role:{
      type:String,
      enum:["user","admin"],
      default:"user"
    },
    savedVideos:[{type:mongoose.Schema.Types.ObjectId,ref:"Videos"}],
  },
  { timestamps: true, collection: "tblusers" }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", userSchema);