// controllers/userController.js
import bcrypt from "bcryptjs";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.join(process.env.DATA_DIR || "./data", "pedidos.db");

async function getDb() {
  return open({ filename: dbPath, driver: sqlite3.Database });
}

// 📋 LISTAR USUARIOS
export async function listUsers(req, res) {
  try {
    const db = await getDb();
    const users = await db.all("SELECT id, username, fullname, role FROM users ORDER BY id ASC");
    res.json(users);
  } catch (err) {
    console.error("❌ Error listUsers:", err);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
}

// ➕ CREAR NUEVO USUARIO
export async function createUser(req, res) {
  try {
    const { username, password, fullname, role } = req.body;

    if (!username || !password || !fullname || !role)
      return res.status(400).json({ error: "Todos los campos son obligatorios" });

    if (!["admin", "worker"].includes(role))
      return res.status(400).json({ error: "Rol inválido" });

    const db = await getDb();
    const existing = await db.get("SELECT id FROM users WHERE username = ?", [username]);
    if (existing)
      return res.status(409).json({ error: "El usuario ya existe" });

    const hashed = await bcrypt.hash(password, 10);
    await db.run(
      "INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, ?)",
      [username, hashed, fullname, role]
    );

    res.status(201).json({ message: "Usuario creado correctamente" });
  } catch (err) {
    console.error("❌ Error createUser:", err);
    res.status(500).json({ error: "Error al crear usuario" });
  }
}
