import { pool } from "../database.js";

/**
 * Devuelve incidencias según rol:
 *  - admin y curro → todas
 *  - worker → solo las suyas
 */
export const getIncidencias = async (req, res) => {
  try {
    const user = req.user;
    let incidencias;

    if (user.role === "admin" || user.username === "curro") {
      const result = await pool.query(`SELECT * FROM incidencias ORDER BY fecha_creacion DESC`);
      incidencias = result.rows;
    } else {
      const result = await pool.query(
        `SELECT * FROM incidencias WHERE assigned_to = $1 ORDER BY fecha_creacion DESC`,
        [user.id]
      );
      incidencias = result.rows;
    }

    // Añadir nombre del asignado
    for (const inc of incidencias) {
      if (inc.assigned_to) {
        const userResult = await pool.query("SELECT fullname FROM users WHERE id = $1", [inc.assigned_to]);
        inc.assigned_name = userResult.rows[0]?.fullname || "Desconocido";
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
    const { titulo, descripcion, assigned_to } = req.body;

    if (!titulo || !assigned_to) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    await pool.query(
      `INSERT INTO incidencias (titulo, descripcion, assigned_to, estado)
       VALUES ($1, $2, $3, 'pendiente')`,
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
    const { id } = req.params;
    const { estado } = req.body;

    await pool.query(
      `UPDATE incidencias
       SET estado=$1, fecha_actualizacion=CURRENT_TIMESTAMP
       WHERE id=$2`,
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
    const { id } = req.params;
    const { contestacion } = req.body;

    await pool.query(
      `UPDATE incidencias
       SET contestacion=$1, fecha_actualizacion=CURRENT_TIMESTAMP
       WHERE id=$2`,
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
    const { id } = req.params;
    await pool.query("DELETE FROM incidencias WHERE id=$1", [id]);
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
    const result = await pool.query(`
      SELECT estado, COUNT(*) AS cantidad
      FROM incidencias
      GROUP BY estado
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error interno al obtener estadísticas" });
  }
}
