// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../database.js"; // ✅ usamos el pool de PostgreSQL
import dotenv from "dotenv";

dotenv.config();

// 🔹 LOGIN
export async function login(req, res) {
  try {
    const { username, password } = req.body;

    // 🔍 Buscar el usuario en PostgreSQL
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // 🔐 Verificar la contraseña
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // 🔑 Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "8h" }
    );

    // ✅ Responder con el token y los datos del usuario
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    res.status(500).json({ error: "Error interno en el servidor" });
  }
}

// 🔹 PERFIL DEL USUARIO
export async function getProfile(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, username, fullname, role FROM users WHERE id = $1",
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(user);
  } catch (err) {
    console.error("❌ Error al obtener perfil:", err);
    res.status(500).json({ error: "Error al obtener el perfil" });
  }
}
