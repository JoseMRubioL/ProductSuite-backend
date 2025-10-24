// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database.js";
import authRoutes from "./routes/authRoutes.js";
import pedidosRoutes from "./routes/pedidosRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// 🧩 CORS configurado para frontend en Tropical Server
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "x-admin-key"]
}));

app.use(express.json());

// 📦 Inicializa la base de datos al arrancar
initializeDatabase();

// ✅ Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/pedidos", pedidosRoutes);

// 🧪 Ruta raíz de prueba
app.get("/", (req, res) => {
  res.json({ message: "✅ API ProductSuite funcionando correctamente" });
});

// 🚀 Arranque del servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend activo en puerto ${PORT}`);
});
