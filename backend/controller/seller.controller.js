 
 // backend/controller/seller.controller.js
import jwt from "jsonwebtoken";

export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.SELLER_EMAIL && password === process.env.SELLER_PASSWORD) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ success: true, message: "Login successful" });
    }
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  } catch {
 
    res.status(500).json({ message: "Internal server error" });
  }
};

 
export const checkAuth = async (_req, res) => {
  res.status(200).json({ success: true });
};

export const sellerLogout = async (_req, res) => {
 
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch {
 
    res.status(500).json({ message: "Internal server error" });
  }
};
