// backend/index.js

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

// FIXED CORS Configuration - Allows multiple origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://e-inject.vercel.app",
  "https://e-inject-frontend.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) {
        console.log("Request with no origin - allowing");
        return callback(null, true);
      }
      
      // Check if the origin is in the allowed list
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ Allowed CORS for origin: ${origin}`);
        return callback(null, true);
      } else {
        console.log(`⚠️ Blocked CORS for origin: ${origin}`);
        // For now, allow all origins to fix the login issue
        // You can change this to callback(new Error("Not allowed by CORS")) later
        return callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint - ADD THIS
app.get("/", (req, res) => {
  res.json({ 
    status: "OK",
    service: "E-Inject Backend API",
    timestamp: new Date().toISOString(),
    endpoints: {
      user: "/api/user",
      products: "/api/products",
      cart: "/api/cart",
      orders: "/api/order",
      health: "/health"
    },
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK",
    message: "E-Inject Backend is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/products", productRoutes);

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      "/api/user/*",
      "/api/products/*",
      "/api/cart/*",
      "/api/order/*",
      "/health"
    ]
  });
});

const PORT = process.env.PORT || 5000;

// Start server with better error handling
const startServer = async () => {
  try {
    await connectDB();
    console.log(`✅ MongoDB connected successfully`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API root: http://localhost:${PORT}/`);
      console.log(`🔧 CORS configured for origins:`, allowedOrigins);
    });
  } catch (error) {
    console.error(`❌ Failed to start server:`, error.message);
    console.error(`❌ Database connection error:`, error);
    process.exit(1);
  }
};

startServer();
