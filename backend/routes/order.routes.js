<<<<<<< HEAD
import express from "express";
import authUser from "../middlewares/authUser.js";
=======
 // backend/routes/order.routes.js
import express from "express";
import authUser from "../middlewares/authUser.js";
import { authSeller } from "../middlewares/authSeller.js";
>>>>>>> master
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  updateOrderStatus,
  getOrderDetails,
} from "../controller/order.controller.js";
<<<<<<< HEAD
import { authSeller } from "../middlewares/authSeller.js";
=======
>>>>>>> master

const router = express.Router();

router.post("/cod", authUser, placeOrderCOD);
router.get("/user", authUser, getUserOrders);
router.get("/seller", authSeller, getAllOrders);
router.patch("/update-status", authSeller, updateOrderStatus);
router.get("/:orderId", authUser, getOrderDetails);

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> master
