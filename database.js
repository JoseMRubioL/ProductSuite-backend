import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const dataDir = process.env.DATA_DIR || "./data";
const dbPath = path.join(dataDir, "pedidos.db");

let dbInstance = null;

export async function initializeDatabase() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    // === TABLA USUARIOS ===
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `);

    // === TABLA PEDIDOS ===
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telefono TEXT NOT NULL,
        tipo_prenda TEXT NOT NULL,
        talla TEXT NOT NULL,
        color TEXT NOT NULL,
        codigo TEXT NOT NULL,
        precio REAL NOT NULL,
        metodo_pago TEXT,
        estado TEXT DEFAULT 'activo',
        notas TEXT,
        fecha_envio TEXT,
        fecha TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // === TABLA INCIDENCIAS ===
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS incidencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'pendiente',
        contestacion TEXT,
        assigned_to INTEGER,
        created_by INTEGER,
        fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );
    `);

    // ✅ === NUEVA TABLA STOCK ===
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo TEXT NOT NULL,
        descripcion TEXT,
        cantidad INTEGER NOT NULL
      );
    `);

    // === USUARIOS INICIALES (solo si no existen) ===
    const users = [
      ["admin", "admin123", "Administrador General", "admin"],
      ["tania", "tania123", "Tania", "worker"],
      ["pepa", "pepa123", "Pepa", "worker"],
      ["chari", "chari123", "Chari", "worker"],
      ["lourdes", "lourdes123", "Lourdes", "worker"],
      ["eva", "eva123", "Eva", "worker"],
      ["curro", "curro123", "Curro", "admin"],
      ["josemiguel", "josemiguel123", "Jose Miguel", "worker"],
    ];

    for (const [username, pass, fullname, role] of users) {
      const existing = await dbInstance.get(
        "SELECT id FROM users WHERE username = ?",
        [username]
      );
      if (!existing) {
        const hashed = await bcrypt.hash(pass, 10);
        await dbInstance.run(
          "INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, ?)",
          [username, hashed, fullname, role]
        );
      }
    }

    console.log("✅ Base de datos inicializada en:", dbPath);
  }

  return dbInstance;
}
