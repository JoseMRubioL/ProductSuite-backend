import { pool } from "../database.js";
import { buildPedidosExcelBuffer } from "../services/excelService.js";

// 🔹 Obtener pedidos
export async function getPedidos(req, res) {
  try {
    const result = await pool.query("SELECT * FROM pedidos ORDER BY fecha DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener pedidos:", err);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
}

// 🔹 Crear pedido
export async function createPedido(req, res) {
  try {
    const { telefono, tipo_prenda, talla, color, codigo, precio, metodo_pago, notas, fecha_envio } = req.body;

    if (!telefono || !tipo_prenda || !talla || !color || !codigo || !precio || !metodo_pago)
      return res.status(400).json({ error: "Campos obligatorios incompletos" });

    await pool.query(
      `INSERT INTO pedidos (telefono, tipo_prenda, talla, color, codigo, precio, metodo_pago, notas, fecha_envio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [telefono, tipo_prenda, talla, color, codigo, precio, metodo_pago, notas, fecha_envio]
    );

    res.json({ message: "Pedido registrado correctamente" });
  } catch (err) {
    console.error("❌ Error al crear pedido:", err);
    res.status(500).json({ error: "Error interno al registrar pedido" });
  }
}

// 🔹 Actualizar pedido
export async function updatePedido(req, res) {
  try {
    const { id } = req.params;
    const { telefono, tipo_prenda, talla, color, codigo, precio, metodo_pago, notas, fecha_envio, estado } = req.body;

    await pool.query(
      `UPDATE pedidos
       SET telefono=$1, tipo_prenda=$2, talla=$3, color=$4, codigo=$5, precio=$6, metodo_pago=$7, notas=$8, fecha_envio=$9, estado=$10
       WHERE id=$11`,
      [telefono, tipo_prenda, talla, color, codigo, precio, metodo_pago, notas, fecha_envio, estado, id]
    );

    res.json({ message: "Pedido actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar pedido:", err);
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
}

// 🔹 Eliminar pedido
export async function deletePedido(req, res) {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM pedidos WHERE id=$1", [id]);
    res.json({ message: "Pedido eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar pedido:", err);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
}

// 🔹 Eliminar todos los pedidos
export async function deleteAllPedidos(req, res) {
  try {
    await pool.query("DELETE FROM pedidos");
    res.json({ message: "Todos los pedidos han sido eliminados" });
  } catch (err) {
    console.error("❌ Error al eliminar todos los pedidos:", err);
    res.status(500).json({ error: "Error al eliminar todos los pedidos" });
  }
}

// 🔹 Exportar pedidos a Excel
export async function exportPedidosExcel(req, res) {
  try {
    const result = await pool.query("SELECT * FROM pedidos ORDER BY telefono ASC, fecha ASC");
    const buffer = await buildPedidosExcelBuffer(result.rows);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="pedidos.xlsx"');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("❌ Error al exportar pedidos:", err);
    res.status(500).json({ error: "Error al exportar pedidos a Excel" });
  }
}
