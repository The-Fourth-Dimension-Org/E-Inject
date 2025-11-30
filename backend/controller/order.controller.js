 // backend/controller/order.controller.js
import mongoose from "mongoose";
import Order from "../models/order.model.js";

const toId = (id) => new mongoose.Types.ObjectId(id);

export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user;
    const { items, addressId } = req.body;

    if (!Array.isArray(items) || items.length === 0 || !addressId)
      return res.status(400).json({ success: false, message: "Invalid order details" });

    for (const it of items) {
      if (!it?.productName || typeof it?.productPrice !== "number" || typeof it?.quantity !== "number")
        return res.status(400).json({ success: false, message: "Invalid item in cart" });
    }

    const amount = items.reduce((sum, it) => sum + it.productPrice * it.quantity, 0);

    const order = await Order.create({
      userId: toId(userId),
      items,
      address: toId(addressId),
      amount,
      paymentType: "COD",
      isPaid: false,
    });

    res.status(201).json({ success: true, message: "Order placed successfully", orderId: order._id });
  } catch (e) {
    console.error("Error in placeOrderCOD:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user }).populate("address").sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllOrders = async (_req, res) => {
  try {
    const orders = await Order.find({}).populate("address").sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const valid = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true }).populate("address");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order status updated successfully", order });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("address");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, order });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
