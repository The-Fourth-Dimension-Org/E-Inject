 // backend/routes/product.routes.js
import express from "express";
import { authSeller } from "../middlewares/authSeller.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProduct,
  bulkUpsertProducts,
} from "../controller/product.controller.js";

const router = express.Router();

// Public
router.get("/", listProducts);
router.get("/:idOrSlug", getProduct);

// Admin-only
router.post("/", authSeller, createProduct);
router.patch("/:id", authSeller, updateProduct);
router.delete("/:id", authSeller, deleteProduct);

// NEW: Bulk upsert (CSV → DB)
router.post("/bulk", authSeller, bulkUpsertProducts);

export default router;
