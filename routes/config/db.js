import  mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/video_project";
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error: ${error.message}");
    process.exit(1);
  }
};

export default connectDB;