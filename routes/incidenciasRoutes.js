// routes/incidenciasRoutes.js
import express from "express";
import {
  getAllIncidencias,
  createIncidencia,
  updateIncidenciaEstado,
  updateIncidenciaContestacion
} from "../controllers/incidenciasController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📋 Obtener todas las incidencias (según rol)
router.get("/", verifyToken, getAllIncidencias);

// 🧾 Crear una nueva incidencia
router.post("/", verifyToken, createIncidencia);

// 🔄 Actualizar estado de una incidencia
router.patch("/:id/estado", verifyToken, updateIncidenciaEstado);

// 💬 Añadir contestación a una incidencia
router.patch("/:id/contestacion", verifyToken, updateIncidenciaContestacion);

export default router;
