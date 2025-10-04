import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Environment se MONGO_URI read karega (backend root me .env file me define hoga)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1); // App ko band kar dega agar DB connect na ho
  }
};

export default connectDB;