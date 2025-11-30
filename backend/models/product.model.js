 // backend/models/product.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name:       { type: String, required: true, trim: true },
    slug:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    description:{ type: String, default: "" },

    price:      { type: Number, required: true, min: 0 },
    stock:      { type: Number, required: true, min: 0, default: 0 },

    images:     [{ type: String }],
    thumbnail:  { type: String },

    category:   { type: String, index: true, trim: true, default: "" },
    brand:      { type: String, index: true, trim: true, default: "" },

    isActive:   { type: Boolean, default: true },

    createdBy:  { type: String, default: null }, // admin (seller) email
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
