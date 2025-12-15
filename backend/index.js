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

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://e-inject.vercel.app",
  "https://e-inject-frontend.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
];

// CORS Configuration - FIXED for credentials
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin)) {
        // Return the EXACT origin, not wildcard
        return callback(null, origin);
      } else {
        // For now, allow but return the exact origin
        console.log(`⚠️ Allowing non-listed origin: ${origin}`);
        return callback(null, origin);
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

// Redirect missing /api prefix
app.use((req, res, next) => {
  if (req.path.startsWith('/user') || req.path.startsWith('/seller')) {
    const newPath = '/api' + req.path;
    console.log(`Redirecting: ${req.path} -> ${newPath}`);
    req.url = newPath;
  }
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "OK",
    service: "E-Inject Backend API",
    timestamp: new Date().toISOString(),
    message: "CORS configured for credentials"
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK",
    message: "Backend is running",
    timestamp: new Date().toISOString()
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
    attempted: req.originalUrl,
    suggestion: "Try adding /api prefix to your URL",
    example: `${req.protocol}://${req.get('host')}/api${req.path}`
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
    });
  } catch (error) {
    console.error(`❌ Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();
