 
 // backend/models/address.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    street:    { type: String, required: true, trim: true },
    city:      { type: String, required: true, trim: true },
    state:     { type: String, required: true, trim: true },
    zipCode:   { type: String, required: true, trim: true }, // keep string to preserve leading 0s
    country:   { type: String, required: true, trim: true },
    phone:     { type: String, required: true, trim: true },

    // 🔑 normalized key to prevent duplicates per user
    addressKey:{ type: String, required: true, index: true },
  },
  { timestamps: true }
);

// ⚠️ Important: unique per (userId + addressKey)
addressSchema.index({ userId: 1, addressKey: 1 }, { unique: true });

export default mongoose.model("Address", addressSchema);
 
