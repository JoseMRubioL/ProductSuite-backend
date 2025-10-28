// backend/database.js
import pkg from "pg";
const { Pool } = pkg;
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: No se encontró DATABASE_URL en .env");
  process.exit(1);
}

// Crear el pool de conexión
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // necesario para Render
  },
});

export async function initializeDatabase() {
  try {
    // 🧱 Crear tablas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
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
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS incidencias (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'pendiente',
        contestacion TEXT,
        assigned_to INTEGER REFERENCES users(id),
        created_by INTEGER REFERENCES users(id),
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 👥 Insertar usuarios iniciales si no existen
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
      const existing = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username]
      );

      if (existing.rows.length === 0) {
        const hashed = await bcrypt.hash(pass, 10);
        await pool.query(
          "INSERT INTO users (username, password, fullname, role) VALUES ($1, $2, $3, $4)",
          [username, hashed, fullname, role]
        );
      }
    }

    console.log("✅ PostgreSQL inicializado correctamente en Render");

  } catch (err) {
    console.error("❌ Error al inicializar la base de datos:", err);
    process.exit(1);
  }
}
