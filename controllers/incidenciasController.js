// controllers/incidenciasController.js
import { initializeIncidenciasDB } from "../databaseIncidencias.js";
import { initializeDatabase } from "../database.js"; // para leer usuarios

/**
 * Devuelve incidencias según rol:
 *  - admin y curro → todas
 *  - worker → solo las suyas
 */
export async function getIncidencias(req, res) {
  try {
    const dbInc = await initializeIncidenciasDB();
    const dbUsers = await initializeDatabase();
    const user = req.user;

    let query = "SELECT * FROM incidencias";
    let params = [];

    if (user.role !== "admin" && user.username !== "curro") {
      const worker = await dbUsers.get(
        "SELECT id FROM users WHERE username = ?",
        [user.username]
      );
      if (!worker) return res.status(404).json({ error: "Usuario no encontrado" });

      query += " WHERE assigned_to = ?";
      params.push(worker.id);
    }

    const incidencias = await dbInc.all(query, params);
    res.json(incidencias);
  } catch (err) {
    console.error("❌ Error al obtener incidencias:", err);
    res.status(500).json({ error: "Error interno al obtener incidencias" });
  }
}

/**
 * Crear una incidencia
 */
export async function createIncidencia(req, res) {
  try {
    const db = await initializeIncidenciasDB();
    const { titulo, descripcion, assigned_to } = req.body;

    if (!titulo || !assigned_to) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    await db.run(
      `INSERT INTO incidencias (titulo, descripcion, assigned_to, estado)
       VALUES (?, ?, ?, 'pendiente')`,
      [titulo, descripcion, assigned_to]
    );

    res.json({ message: "✅ Incidencia creada correctamente" });
  } catch (err) {
    console.error("❌ Error al crear incidencia:", err);
    res.status(500).json({ error: "Error al crear incidencia" });
  }
}

/**
 * Actualizar estado
 */
export async function updateEstado(req, res) {
  try {
    const db = await initializeIncidenciasDB();
    const { id } = req.params;
    const { estado } = req.body;

    await db.run(
      `UPDATE incidencias 
       SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [estado, id]
    );

    res.json({ message: "✅ Estado actualizado" });
  } catch (err) {
    console.error("❌ Error al actualizar estado:", err);
    res.status(500).json({ error: "Error al actualizar estado" });
  }
}

/**
 * Actualizar contestación
 */
export async function updateContestacion(req, res) {
  try {
    const db = await initializeIncidenciasDB();
    const { id } = req.params;
    const { contestacion } = req.body;

    await db.run(
      `UPDATE incidencias 
       SET contestacion = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [contestacion, id]
    );

    res.json({ message: "✅ Contestación actualizada" });
  } catch (err) {
    console.error("❌ Error al actualizar contestación:", err);
    res.status(500).json({ error: "Error al actualizar contestación" });
  }
}

/**
 * Eliminar incidencia
 */
export async function deleteIncidencia(req, res) {
  try {
    const db = await initializeIncidenciasDB();
    const { id } = req.params;

    await db.run("DELETE FROM incidencias WHERE id = ?", [id]);
    res.json({ message: "🗑️ Incidencia eliminada" });
  } catch (err) {
    console.error("❌ Error al eliminar incidencia:", err);
    res.status(500).json({ error: "Error al eliminar incidencia" });
  }
}

/**
 * Estadísticas globales
 */
export async function getEstadisticas(req, res) {
  try {
    const db = await initializeIncidenciasDB();

    const data = await db.all(`
      SELECT estado, COUNT(*) AS cantidad
      FROM incidencias
      GROUP BY estado
    `);

    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error interno al obtener estadísticas" });
  }
}
