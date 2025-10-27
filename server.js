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

app.use(
  cors({
    origin: [
      "https://productsuitelaka.es",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initializeDatabase();

app.use("/api/auth", authRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api/incidencias", incidenciasRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "✅ API ProductSuite funcionando correctamente 🚀",
    status: "online",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend activo y escuchando en puerto ${PORT}`);
});
