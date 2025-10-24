import express from "express";
import {
  getPedidos,
  createPedido,
  updatePedido,
  deletePedido,
  deleteAllPedidos,
  exportPedidosExcel
} from "../controllers/pedidosController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getPedidos);
router.post("/", verifyToken, createPedido);
router.put("/:id", verifyToken, updatePedido);
router.delete("/:id", verifyToken, deletePedido);
router.delete("/", verifyToken, deleteAllPedidos);
router.get("/export", verifyToken, exportPedidosExcel);

export default router;
