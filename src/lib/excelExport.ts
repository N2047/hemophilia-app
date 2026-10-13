import ExcelJS from 'exceljs';

/**
 * Sanitize cell values against CSV/Excel formula injection
 */
export function sanitizeCellValue(val: any): any {
  if (typeof val === 'string') {
    // If the string starts with =, +, -, @, \t, \r, escape it with a single quote
    if (/^[=+\-@\t\r]/.test(val)) {
      return `'${val}`;
    }
    return val;
  }
  return val;
}

export interface ExcelColumnDef {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelSheetDef {
  sheetName: string;
  columns: ExcelColumnDef[];
  rows: Record<string, any>[];
  title?: string;
  headerColor?: string; // hex ARGB, e.g. 'FF0F766E' (Teal), 'FF991B1B' (Ruby), 'FF1E3A8A' (Navy), 'FFB45309' (Amber)
}

function applyWorksheetStyles(
  worksheet: ExcelJS.Worksheet,
  sheetDef: ExcelSheetDef
) {
  const { columns, rows, title, headerColor = 'FF0F766E' } = sheetDef;

  // Set column keys and widths
  worksheet.columns = columns.map((c) => ({
    key: c.key,
    width: c.width || 18,
  }));

  let headerRowNum = 1;

  // Optional Title row
  if (title) {
    const titleRow = worksheet.addRow([title]);
    titleRow.height = 32;
    titleRow.font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF1E293B' } };
    titleRow.alignment = { vertical: 'middle', horizontal: 'left' };

    const spacer = worksheet.addRow([]);
    spacer.height = 8;
    headerRowNum = 3;
  }

  // Explicit Header row
  const headerRow = worksheet.getRow(headerRowNum);
  headerRow.values = columns.map((c) => c.header);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: headerColor },
    };
    cell.font = {
      name: 'Arial',
      size: 11,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF334155' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  // Add Rows
  rows.forEach((row, idx) => {
    const sanitizedRow: Record<string, any> = {};
    for (const col of columns) {
      sanitizedRow[col.key] = sanitizeCellValue(row[col.key]);
    }
    const r = worksheet.addRow(sanitizedRow);
    r.height = 22;

    const isEven = idx % 2 === 0;
    r.eachCell((cell) => {
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });
}

export async function generateExcelWorkbook(
  sheetName: string,
  columns: ExcelColumnDef[],
  rows: Record<string, any>[],
  title?: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Hemophilia Factor Management System (नेपाल हेमोफिलिया सोसाइटी)';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
  });

  applyWorksheetStyles(worksheet, { sheetName, columns, rows, title });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateMultiSheetWorkbook(
  sheets: ExcelSheetDef[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Hemophilia Factor Management System (नेपाल हेमोफिलिया सोसाइटी)';
  workbook.created = new Date();

  for (const sheetDef of sheets) {
    const worksheet = workbook.addWorksheet(sheetDef.sheetName, {
      views: [{ showGridLines: true }],
    });
    applyWorksheetStyles(worksheet, sheetDef);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
