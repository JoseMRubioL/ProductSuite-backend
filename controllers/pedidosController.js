import { initializeDatabase } from "../database.js";
import { buildPedidosExcelBuffer } from "../services/excelService.js";

// 🔹 Obtener pedidos
export async function getPedidos(req, res) {
  try {
    const db = await initializeDatabase();
    const pedidos = await db.all("SELECT * FROM pedidos ORDER BY fecha DESC");
    res.json(pedidos);
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

    const db = await initializeDatabase();
    await db.run(
      `INSERT INTO pedidos (telefono, tipo_prenda, talla, color, codigo, precio, metodo_pago, notas, fecha_envio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    const db = await initializeDatabase();
    await db.run(
      `UPDATE pedidos
       SET telefono=?, tipo_prenda=?, talla=?, color=?, codigo=?, precio=?, metodo_pago=?, notas=?, fecha_envio=?, estado=?
       WHERE id=?`,
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
    const db = await initializeDatabase();
    await db.run("DELETE FROM pedidos WHERE id=?", [id]);
    res.json({ message: "Pedido eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar pedido:", err);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
}

// 🔹 Eliminar todos los pedidos
export async function deleteAllPedidos(req, res) {
  try {
    const db = await initializeDatabase();
    await db.run("DELETE FROM pedidos");
    res.json({ message: "Todos los pedidos han sido eliminados" });
  } catch (err) {
    console.error("❌ Error al eliminar todos los pedidos:", err);
    res.status(500).json({ error: "Error al eliminar todos los pedidos" });
  }
}

// 🔹 Exportar pedidos a Excel
export async function exportPedidosExcel(req, res) {
  try {
    const db = await initializeDatabase();
    const pedidos = await db.all("SELECT * FROM pedidos ORDER BY telefono ASC, fecha ASC");
    const buffer = await buildPedidosExcelBuffer(pedidos);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="pedidos.xlsx"');
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("❌ Error al exportar pedidos:", err);
    res.status(500).json({ error: "Error al exportar pedidos a Excel" });
  }
}
