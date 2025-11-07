import Order from "../models/order.model.js";

// Place order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;
    
    if (!address || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid order details", success: false });
    }

    // Calculate amount from items (no tax added)
    let amount = items.reduce((acc, item) => {
      return acc + (item.productPrice * item.quantity);
    }, 0);

    const order = await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "COD",
      isPaid: false,
    });

    res.status(201).json({ 
      message: "Order placed successfully", 
      success: true,
      orderId: order._id 
    });
  } catch (error) {
    console.error("Error in placeOrderCOD:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Order details for individual user: /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({ userId })
      .populate("address")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all orders for admin: /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("address")
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update order status: /api/order/update-status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    const validStatuses = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status", success: false });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("address");

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found", success: false });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get single order details: /api/order/:orderId
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("address");

    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};