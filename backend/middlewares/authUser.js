 
 // backend/middlewares/authUser.js
import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const { token } = req.cookies || {};
  if (!token) return res.status(401).json({ message: "Unauthorized", success: false });
 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
 
  } catch {
 
    return res.status(401).json({ message: "Invalid token", success: false });
  }
};

export default authUser;
