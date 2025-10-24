import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { initializeDatabase } from "../database.js";
import dotenv from "dotenv";

dotenv.config();

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const db = await initializeDatabase();

    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Usuario o contraseña incorrectos" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, fullname: user.fullname, role: user.role },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ error: "Error interno en el servidor" });
  }
}

export async function getProfile(req, res) {
  try {
    const db = await initializeDatabase();
    const user = await db.get("SELECT id, username, fullname, role FROM users WHERE id = ?", [req.user.id]);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
}
