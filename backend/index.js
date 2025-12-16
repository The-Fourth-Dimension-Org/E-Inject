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

/* =======================
   ✅ ALLOWED ORIGINS
======================= */
const allowedOrigins = [
  "https://e-inject.vercel.app",
  "https://e-inject-frontend.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000"
];

/* =======================
   ✅ PROPER CORS CONFIG
======================= */
app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server / postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// middleware order matters
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* =======================
   ✅ HEALTH CHECK
======================= */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "E-Inject Backend",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    origin: req.headers.origin || "no-origin"
  });
});

/* =======================
   ✅ API ROUTES
======================= */
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/products", productRoutes);

/* =======================
   ❌ 404 HANDLER
======================= */
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});

/* =======================
   ✅ DATABASE CONNECT
======================= */
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB error:", err));

/* =======================
   🚀 IMPORTANT FOR VERCEL
======================= */
export default app;
