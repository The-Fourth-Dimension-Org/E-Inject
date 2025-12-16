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

// ============================================
// ULTIMATE CORS FIX - No wildcard, exact origin
// ============================================
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // ALWAYS set a specific origin, never *
  if (origin && (
    origin === "https://e-inject.vercel.app" ||
    origin === "http://localhost:5173" ||
    origin === "http://localhost:3000"
  )) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // Default to the main frontend URL
    res.setHeader("Access-Control-Allow-Origin", "https://e-inject.vercel.app");
  }
  
  // CRITICAL for credentials
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Debug endpoint to verify CORS headers
app.get("/cors-check", (req, res) => {
  res.json({
    success: true,
    message: "CORS check endpoint",
    timestamp: new Date().toISOString(),
    requestOrigin: req.headers.origin || "none",
    responseHeaders: {
      "Access-Control-Allow-Origin": res.getHeader("Access-Control-Allow-Origin"),
      "Access-Control-Allow-Credentials": res.getHeader("Access-Control-Allow-Credentials")
    },
    cookies: req.cookies
  });
});

// Simple health check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "E-Inject Backend",
    cors: "Configured for exact origins only"
  });
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
      console.log("✅ CORS: Exact origins only, no wildcard");
    });
  } catch (error) {
    console.error("❌ Server failed:", error);
    process.exit(1);
  }
};

startServer();
