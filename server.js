// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database.js";
import authRoutes from "./routes/authRoutes.js";
import pedidosRoutes from "./routes/pedidosRoutes.js";
import incidenciasRoutes from "./routes/incidenciasRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api/incidencias", incidenciasRoutes);

// Inicializa base de datos al arrancar
initializeDatabase();

// ✅ Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/pedidos", pedidosRoutes);

// Ruta raíz de prueba
app.get("/", (req, res) => res.send("✅ API ProductSuite en ejecución"));

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
