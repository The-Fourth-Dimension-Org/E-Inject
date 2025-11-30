<<<<<<< HEAD
=======
 // backend/index.js
>>>>>>> master
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
<<<<<<< HEAD
import { connectDB } from "./config/connectDB.js";
dotenv.config();
=======
dotenv.config();

import { connectDB } from "./config/connectDB.js";

>>>>>>> master
import userRoutes from "./routes/user.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import addressRoutes from "./routes/address.routes.js";
import orderRoutes from "./routes/order.routes.js";
<<<<<<< HEAD


const app = express();

// allow multiple origins
const allowedOrigins = ["http://localhost:5173"];
//middlewares
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Api endpoints
=======
import productRoutes from "./routes/product.routes.js";

const app = express();

// Allow only your frontend origins
const allowlist = ["http://localhost:5173"];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(cookieParser());

// ✅ body size limit বাড়ালাম (ডিফল্ট ~100KB ছিল)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
>>>>>>> master
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/order", orderRoutes);
<<<<<<< HEAD

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
=======
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running at http://localhost:${PORT}`);
>>>>>>> master
});
