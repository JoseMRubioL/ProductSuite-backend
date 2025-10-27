// controllers/incidenciasController.js
import { initializeDatabase } from "../database.js";

/**
 * 📋 Obtener todas las incidencias
 * - Los admins o "curro" ven todas
 * - Los trabajadores solo las asignadas a ellos
 */
export async function getAllIncidencias(req, res) {
  try {
    const db = await initializeDatabase();
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();
    const username = req.user?.username?.toLowerCase();

    let query = `
      SELECT 
        i.id,
        i.titulo,
        i.descripcion,
        i.estado,
        i.contestacion,
        i.fecha_creacion,
        i.fecha_actualizacion,
        i.assigned_to,
        i.created_by,
        u1.fullname AS assigned_to_name,
        u2.fullname AS created_by_name
      FROM incidencias i
      LEFT JOIN users u1 ON i.assigned_to = u1.id
      LEFT JOIN users u2 ON i.created_by = u2.id
    `;

    // 🔐 Si no es admin o Curro, filtrar por las asignadas a él
    if (role !== "admin" && username !== "curro") {
      query += " WHERE i.assigned_to = ?";
    }

    query += " ORDER BY i.fecha_creacion DESC";

    const incidencias =
      role === "admin" || username === "curro"
        ? await db.all(query)
        : await db.all(query, [userId]);

    res.json(incidencias);
  } catch (error) {
    console.error("❌ Error al obtener incidencias:", error);
    res.status(500).json({ error: "Error al obtener incidencias" });
  }
}

/**
 * 🧾 Crear una nueva incidencia
 */
export async function createIncidencia(req, res) {
  try {
    const db = await initializeDatabase();
    const { titulo, descripcion, assigned_to } = req.body;
    const created_by = req.user?.id;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: "Título y descripción son obligatorios" });
    }

    await db.run(
      `
      INSERT INTO incidencias (titulo, descripcion, estado, assigned_to, created_by)
      VALUES (?, ?, 'pendiente', ?, ?)
    `,
      [titulo, descripcion, assigned_to || null, created_by]
    );

    res.status(201).json({ message: "✅ Incidencia creada correctamente" });
  } catch (error) {
    console.error("❌ Error al crear incidencia:", error);
    res.status(500).json({ error: "Error al crear incidencia" });
  }
}

/**
 * ✏️ Actualizar el estado de una incidencia
 */
export async function updateIncidenciaEstado(req, res) {
  try {
    const db = await initializeDatabase();
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: "El estado es obligatorio" });
    }

    await db.run(
      `
      UPDATE incidencias
      SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [estado, id]
    );

    res.json({ message: "✅ Estado de incidencia actualizado" });
  } catch (error) {
    console.error("❌ Error al actualizar estado de incidencia:", error);
    res.status(500).json({ error: "Error al actualizar estado de incidencia" });
  }
}

/**
 * 💬 Añadir una contestación
 */
export async function updateIncidenciaContestacion(req, res) {
  try {
    const db = await initializeDatabase();
    const { id } = req.params;
    const { contestacion } = req.body;

    await db.run(
      `
      UPDATE incidencias
      SET contestacion = ?, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [contestacion, id]
    );

    res.json({ message: "✅ Contestación guardada" });
  } catch (error) {
    console.error("❌ Error al guardar contestación:", error);
    res.status(500).json({ error: "Error al guardar contestación" });
  }
}
