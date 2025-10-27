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

// 🧩 CORS configurado para frontend en Tropical Server y Render
app.use(
  cors({
    origin: [
      "https://productsuitelaka.es", // 🌐 tu frontend en Tropical Server
      "http://localhost:5173",      // para desarrollo local (opcional)
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅ incluye PATCH y OPTIONS
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ permite cabeceras necesarias
    credentials: true,
  })
);

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📦 Inicializa la base de datos al arrancar
initializeDatabase();

// ✅ Rutas API principales
app.use("/api/auth", authRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/incidencias", incidenciasRoutes);

// 🧪 Ruta raíz de prueba
app.get("/", (req, res) => {
  res.json({
    message: "✅ API ProductSuite funcionando correctamente 🚀",
    status: "online",
  });
});

// 🚀 Arranque del servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend activo y escuchando en puerto ${PORT}`);
});
