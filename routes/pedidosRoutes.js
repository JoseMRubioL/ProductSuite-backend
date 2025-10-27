import express from "express";
import {
  getPedidos,
  createPedido,
  updatePedido,
  deletePedido,
  deleteAllPedidos,
  exportPedidosExcel,
} from "../controllers/pedidosController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📦 CRUD pedidos
router.get("/", verifyToken, getPedidos);
router.post("/", verifyToken, createPedido);
router.put("/:id", verifyToken, updatePedido);
router.delete("/:id", verifyToken, deletePedido);
router.delete("/", verifyToken, deleteAllPedidos);

// 📤 Exportar pedidos a Excel
// 🟢 La ruta ahora coincide con el frontend: /api/pedidos/export/excel
router.get("/export/excel", verifyToken, exportPedidosExcel);

export default router;
