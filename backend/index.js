// backend/index.js
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./config/connectDB.js";
import userRoutes from "./routes/user.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
import productRoutes from "./routes/product.routes.js";

const app = express();

// CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://e-inject.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Cookie");
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Test endpoint - এটাই প্রমাণ করবে নতুন কোড চলছে
app.get("/", (req, res) => {
  res.json({
    message: "✅ E-Inject Backend - NEW VERSION DEPLOYED",
    timestamp: new Date().toISOString(),
    version: "2.0",
    endpoints: {
      user: "/api/user",
      seller: "/api/seller",
      products: "/api/products"
    }
  });
});

// Direct test endpoints
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API test endpoint works" });
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log("🔄 NEW CODE DEPLOYED - Root endpoint should show version 2.0");
    });
  } catch (error) {
    console.error("❌ Server failed:", error);
    process.exit(1);
  }
};

startServer();
