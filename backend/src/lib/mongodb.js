import mongoose from 'mongoose';
import { wrapAsync } from './wrapAsync';

const connectDB = wrapAsync(async() => {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected successfully");
})

export default connectDB;