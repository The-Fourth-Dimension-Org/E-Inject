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

// ✅ FIXED CORS for Render.com
const allowedOrigins = [
  "https://e-inject.vercel.app",      
  "https://e-inject.onrender.com",   
  "http://localhost:5173",            
  "http://localhost:5000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        // Log blocked origins for debugging
        console.log(`❌ CORS blocked: ${origin}`);
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Test endpoint
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "✅ E-Inject Backend on Render.com",
    allowedOrigins: allowedOrigins
  });
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
// ... other routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Allowed origins:`, allowedOrigins);
});
