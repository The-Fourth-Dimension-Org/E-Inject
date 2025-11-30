<<<<<<< HEAD
import express from "express";
import {
  checkAuth,
  sellerLogin,
  sellerLogout,
} from "../controller/seller.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
const router = express.Router();

=======
 // backend/routes/seller.routes.js
import express from "express";
import { checkAuth, sellerLogin, sellerLogout } from "../controller/seller.controller.js";
import { authSeller } from "../middlewares/authSeller.js";
import User from "../models/user.model.js";

const router = express.Router();

// Admin auth
>>>>>>> master
router.post("/login", sellerLogin);
router.get("/is-auth", authSeller, checkAuth);
router.get("/logout", authSeller, sellerLogout);

<<<<<<< HEAD
=======
// ✅ Get all users (admin only) — BAN/UNBAN নেই
router.get("/users", authSeller, async (_req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("GET /seller/users error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

>>>>>>> master
export default router;
