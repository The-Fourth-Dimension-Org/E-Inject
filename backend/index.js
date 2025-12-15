import express from "express";
import cors from "cors";
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

// ALLOWED ORIGINS - Must match exactly
const allowedOrigins = [
  "https://e-inject.vercel.app",
  "http://localhost:5173",
  "https://e-inject-frontend.vercel.app",
  "http://localhost:3000"
];

// CRITICAL FIX: Manual CORS headers to avoid wildcard *
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is in allowed list
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin); // Set EXACT origin
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie, X-Requested-With");
    
    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
  }
  
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "OK",
    service: "E-Inject Backend",
    timestamp: new Date().toISOString(),
    cors: "Manual CORS headers - No wildcard"
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK",
    message: "Backend with fixed CORS",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || "No origin header"
  });
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/products", productRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log(`✅ MongoDB connected successfully`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`✅ CORS configured for:`, allowedOrigins);
      console.log(`⚠️  IMPORTANT: Using manual CORS headers (no wildcard)`);
    });
  } catch (error) {
    console.error(`❌ Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();
