<<<<<<< HEAD
=======
 // backend/routes/address.routes.js
>>>>>>> master
import express from "express";
import authUser from "../middlewares/authUser.js";
import { addAddress, getAddress } from "../controller/address.controller.js";

const router = express.Router();
router.post("/add", authUser, addAddress);
router.get("/get", authUser, getAddress);
<<<<<<< HEAD
=======

>>>>>>> master
export default router;
