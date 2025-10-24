import { initializeDatabase } from "../database.js";

let db;
initializeDatabase().then((dbConn) => (db = dbConn));

export const obtenerStock = async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM stock ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener el stock:", error);
    res.status(500).json({ error: "Error al obtener stock" });
  }
};

export const agregarProducto = async (req, res) => {
  try {
    const { codigo, descripcion, cantidad } = req.body;
    if (!codigo || !cantidad)
      return res.status(400).json({ error: "Código y cantidad son obligatorios" });

    await db.run(
      "INSERT INTO stock (codigo, descripcion, cantidad) VALUES (?, ?, ?)",
      [codigo, descripcion || "", cantidad]
    );

    res.json({ message: "✅ Producto agregado correctamente" });
  } catch (error) {
    console.error("❌ Error al agregar producto:", error);
    res.status(500).json({ error: "Error al agregar producto" });
  }
};

export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("DELETE FROM stock WHERE id = ?", [id]);
    res.json({ message: "🗑️ Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};

export const eliminarTodo = async (req, res) => {
  try {
    await db.run("DELETE FROM stock");
    res.json({ message: "🧹 Todo el stock eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar todo el stock:", error);
    res.status(500).json({ error: "Error al eliminar todo el stock" });
  }
};
