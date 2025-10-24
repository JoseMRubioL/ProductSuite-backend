// services/excelService.js
import ExcelJS from "exceljs";

/**
 * Devuelve un Buffer de Excel con los pedidos:
 * - agrupados por teléfono
 * - fila en blanco entre clientes
 * - columnas con anchuras adecuadas
 */
export async function buildPedidosExcelBuffer(pedidos = []) {
  // Agrupar por teléfono
  const groups = new Map();
  pedidos.forEach((p) => {
    const tel = (p.telefono || "").trim();
    if (!groups.has(tel)) groups.set(tel, []);
    groups.get(tel).push(p);
  });

  const sortedPhones = Array.from(groups.keys()).sort((a, b) => a.localeCompare(b, "es"));

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Pedidos", {
    properties: { tabColor: { argb: "FF007B9E" } }
  });

  // Encabezados
  sheet.columns = [
    { header: "Teléfono", key: "telefono", width: 14 },
    { header: "Tipo prenda", key: "tipo_prenda", width: 20 },
    { header: "Talla", key: "talla", width: 10 },
    { header: "Color", key: "color", width: 14 },
    { header: "Código", key: "codigo", width: 16 },
    { header: "Precio (€)", key: "precio", width: 12 },
    { header: "Método pago", key: "metodo_pago", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Notas", key: "notas", width: 30 },
    { header: "Fecha envío", key: "fecha_envio", width: 18 },
    { header: "Fecha registro", key: "fecha", width: 20 }
  ];

  // Estilo cabecera
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF007B9E" }
  };

  // Filas por grupo
  sortedPhones.forEach((tel, idx) => {
    const list = groups.get(tel).slice().sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));

    list.forEach((p) => {
      sheet.addRow({
        telefono: p.telefono || "",
        tipo_prenda: p.tipo_prenda || "",
        talla: p.talla || "",
        color: p.color || "",
        codigo: p.codigo || "",
        precio: Number(p.precio ?? 0),
        metodo_pago: p.metodo_pago || "",
        estado: p.estado || "",
        notas: p.notas || "",
        fecha_envio: p.fecha_envio || "",
        fecha: p.fecha || ""
      });
    });

    // Fila en blanco entre clientes (si no es el último)
    if (idx < sortedPhones.length - 1) sheet.addRow({});
  });

  // Bordes ligeros (opcional)
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFD9D9D9" } }
      };
    });
  });

  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
