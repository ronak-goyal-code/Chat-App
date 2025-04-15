import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const instance = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected at: ${instance.connection.host}`);
    console.log(`MongoDB connected at: ${instance.connection.port}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
}