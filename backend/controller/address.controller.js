 
 // backend/controller/address.controller.js
import mongoose from "mongoose";
import Address from "../models/address.model.js";

// helpers
const normalizeSpace = (s = "") =>
  s.toString().trim().replace(/\s+/g, " ").toLowerCase();

const normalizePhone = (s = "") =>
  s.toString().replace(/[^\d+]/g, ""); // keep digits and leading +

// build a deterministic key so same physical address maps to same key
const makeAddressKey = (addr) => {
  const street  = normalizeSpace(addr.street);
  const city    = normalizeSpace(addr.city);
  const state   = normalizeSpace(addr.state);
  const zip     = normalizeSpace(addr.zipCode);
  const country = normalizeSpace(addr.country);
  const phone   = normalizePhone(addr.phone);
  // do NOT include first/last/email in key so name/email change won't duplicate the address
  return [street, city, state, zip, country, phone].join("|");
};

// POST /api/address/add
// If same user posts same address again → return existing, do not duplicate.
export const addAddress = async (req, res) => {
  try {
    const userId = req.user;
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, message: "No address payload" });
    }

    const addressKey = makeAddressKey(address);

    // 1) check if exists for this user
    const existing = await Address.findOne({ userId, addressKey });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Address already saved",
        addressId: existing._id,
      });
    }

    // 2) create new
    const saved = await Address.create({
      ...address,
      userId: new mongoose.Types.ObjectId(userId),
      addressKey,
    });

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addressId: saved._id,
    });
  } catch (err) {
    // Handle unique race (duplicate key) gracefully
    if (err?.code === 11000) {
      const userId = req.user;
      const { address } = req.body || {};
      const addressKey = makeAddressKey(address || {});
      const existing = await Address.findOne({ userId, addressKey });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Address already saved",
          addressId: existing._id,
        });
      }
    }
    console.error("addAddress error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// GET /api/address/get
export const getAddress = async (req, res) => {
  try {
    const userId = req.user;
    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
 
  }
};
