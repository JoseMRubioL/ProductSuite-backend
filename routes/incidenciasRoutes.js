import express from "express";
import {
  getIncidencias,
  createIncidencia,
  updateEstado,
  updateContestacion,
  deleteIncidencia,
  getEstadisticas,
} from "../controllers/incidenciasController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getIncidencias);
router.post("/", verifyToken, createIncidencia);
router.patch("/:id/estado", verifyToken, updateEstado);
router.patch("/:id/contestacion", verifyToken, updateContestacion);
router.delete("/:id", verifyToken, deleteIncidencia);
router.get("/estadisticas", verifyToken, getEstadisticas);

export default router;
