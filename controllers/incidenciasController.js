// controllers/incidenciasController.js
import { initializeIncidenciasDB } from "../databaseIncidencias.js";
import { initializeDatabase } from "../database.js"; // para leer usuarios

/**
 * Devuelve incidencias según rol:
 *  - admin y curro → todas
 *  - worker → solo las suyas
 */
export const getIncidencias = async (req, res) => {
  try {
    const dbIncidencias = await initializeIncidenciasDB();
    const dbUsuarios = await initializeDatabase();
    const user = req.user;

    // Obtener incidencias base
    let incidencias = [];
    if (user.role === "admin" || user.username === "curro") {
      incidencias = await dbIncidencias.all(`
        SELECT * FROM incidencias
        ORDER BY fecha_creacion DESC
      `);
    } else {
      incidencias = await dbIncidencias.all(
        `SELECT * FROM incidencias WHERE assigned_to = ? ORDER BY fecha_creacion DESC`,
        [user.id]
      );
    }

    // Añadir el nombre del asignado usando la tabla de usuarios
    for (const inc of incidencias) {
      if (inc.assigned_to) {
        const usuario = await dbUsuarios.get(
          "SELECT fullname FROM users WHERE id = ?",
          [inc.assigned_to]
        );
        inc.assigned_name = usuario ? usuario.fullname : "Desconocido";
      } else {
        inc.assigned_name = "Sin asignar";
      }
    }

    res.json(incidencias);
  } catch (error) {
    console.error("❌ Error al obtener incidencias:", error);
    res.status(500).json({ error: "Error al obtener incidencias" });
  }
};

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
