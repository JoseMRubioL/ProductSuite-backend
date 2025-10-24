import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  jwt.verify(token, process.env.JWT_SECRET || "supersecret", (err, decoded) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = decoded;
    next();
  });
}

export function isAdmin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Acceso denegado: no eres administrador" });
  next();
}

