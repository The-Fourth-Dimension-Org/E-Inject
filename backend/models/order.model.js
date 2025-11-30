<<<<<<< HEAD
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, ref: "User" },
    items: [
      {
        productName: { type: String, required: true },
        productPrice: { type: Number, required: true },
        productImage: { type: String },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: String, required: true, ref: "Address" },
    status: { 
      type: String, 
      default: "Order Placed",
      enum: ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"]
    },
    paymentType: { type: String, required: true },
=======
 // backend/models/order.model.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    userId:  { type: Schema.Types.ObjectId, required: true, ref: "User" },
    items: [
      {
        productName:  { type: String, required: true },
        productPrice: { type: Number, required: true, min: 0 },
        productImage: { type: String },
        quantity:     { type: Number, required: true, min: 1 },
      },
    ],
    amount:  { type: Number, required: true, min: 0 },
    address: { type: Schema.Types.ObjectId, required: true, ref: "Address" },
    status:  {
      type: String,
      default: "Order Placed",
      enum: ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
    },
    paymentType: { type: String, required: true, enum: ["COD", "ONLINE"] },
>>>>>>> master
    isPaid: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

<<<<<<< HEAD
const Order = mongoose.model("Order", orderSchema);
export default Order;
=======
export default mongoose.model("Order", orderSchema);
>>>>>>> master
