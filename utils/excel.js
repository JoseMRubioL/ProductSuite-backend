import ExcelJS from "exceljs";

export async function generarExcelPedidos(pedidos) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Pedidos");

  sheet.columns = [
    { header: "ID", key: "id", width: 6 },
    { header: "Teléfono", key: "telefono", width: 15 },
    { header: "Prenda", key: "tipo_prenda", width: 20 },
    { header: "Talla", key: "talla", width: 10 },
    { header: "Color", key: "color", width: 12 },
    { header: "Código", key: "codigo", width: 15 },
    { header: "Precio (€)", key: "precio", width: 12 },
    { header: "Método Pago", key: "metodo_pago", width: 18 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "Tipo Operación", key: "tipo_operacion", width: 16 },
    { header: "Motivo", key: "motivo", width: 25 },
    { header: "Fecha", key: "fecha", width: 22 },
  ];

  sheet.addRows(pedidos);

  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "1E3A8AFF" } };
  header.alignment = { horizontal: "center" };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
