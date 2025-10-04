import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from "../config/db.js";
import userRoutes from "../routes/userRoutes.js";
import videoRoutes from "../routes/videoRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import adminRoutes from "../routes/adminRoutes.js";
import mongoose from 'mongoose';

const app = express();

const PORT= process.env.PORT||5173;
const MONGO_URL=process.env.MONGO_URL||"mongodb://127.0.0.1:27017/video_project"

app.use(cors({origin:"http://localhost:5174",credentials:true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('JWT_SECRET present?', !!process.env.JWT_SECRET);

app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admins', adminRoutes);



app.get('/', (req, res) => {res.json({ ok: true, message: 'Video Library API' });
});

mongoose.connect(MONGO_URL,{dbName:process.env.DB_NAME||"video_project"})
.then(()=>{
    console.log("Connected to MongoDB");
    app.listen(PORT,()=>{
        console.log(`Server running on http://localhost:${PORT} `)
    });
})
.catch((err)=>{
    console.error("MongoDB connection error:",err.message);
});
