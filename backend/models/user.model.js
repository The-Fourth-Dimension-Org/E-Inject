 
 // backend/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    cartItems: { type: Object, default: {} },
    // 👇 NEW: admin actions
    banned: { type: Boolean, default: false }, // default false
  },
  { minimize: false, timestamps: true }
);

export default mongoose.model("User", userSchema);
 
