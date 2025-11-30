import mongoose, { mongo } from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
<<<<<<< HEAD
    process.exit(1);
=======
    process.exit(1); 
>>>>>>> master
  }
};
