// databaseIncidencias.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";

const dataDir = "./data";
const dbPath = path.join(dataDir, "incidencias.db");

let dbIncidencias = null;

export async function initializeIncidenciasDB() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  if (!dbIncidencias) {
    dbIncidencias = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await dbIncidencias.exec(`
      CREATE TABLE IF NOT EXISTS incidencias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estado TEXT DEFAULT 'pendiente',
        assigned_to INTEGER,
        contestacion TEXT,
        fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Base de datos de incidencias inicializada en:", dbPath);
  }

  return dbIncidencias;
}
