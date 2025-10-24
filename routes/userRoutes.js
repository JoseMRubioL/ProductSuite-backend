// routes/userRoutes.js
import express from "express";
import { listUsers, createUser } from "../controllers/userController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, isAdmin, listUsers);
router.post("/", verifyToken, isAdmin, createUser);

export default router;
