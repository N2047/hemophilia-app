import { describe, it, expect } from 'vitest';
import ExcelJS from 'exceljs';
import {
  generateExcelWorkbook,
  generateMultiSheetWorkbook,
  sanitizeCellValue,
  ExcelSheetDef,
} from '../src/lib/excelExport';

describe('Excel Generation and Formula Injection Protection', () => {
  it('escapes cells starting with =, +, -, @ to prevent Excel formula injection', () => {
    expect(sanitizeCellValue('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(sanitizeCellValue('+12345')).toBe("'+12345");
    expect(sanitizeCellValue('-10')).toBe("'-10");
    expect(sanitizeCellValue('@cmd')).toBe("'@cmd");
    expect(sanitizeCellValue('Ordinary Patient Name')).toBe('Ordinary Patient Name');
  });

  it('generates a valid .xlsx buffer with columns and rows', async () => {
    const columns = [
      { header: 'Patient Code', key: 'code', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Factor', key: 'factor', width: 15 },
    ];
    const rows = [
      { code: 'HEP-2026-0001', name: 'Nabin Dhungel', factor: 'Factor VIII' },
      { code: 'HEP-2026-0002', name: 'Sita Sharma', factor: 'Factor IX' },
    ];

    const buffer = await generateExcelWorkbook('TestSheet', columns, rows, 'Title Banner');
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(1000);
    // Check PK zip header for valid XLSX
    expect(buffer[0]).toBe(0x50); // 'P'
    expect(buffer[1]).toBe(0x4b); // 'K'
  });

  it('generates a 4-sheet consolidated master workbook matching Nepal Hemophilia Society specifications', async () => {
    const sheet1: ExcelSheetDef = {
      sheetName: '१. बिरामी अभिलेखीकरण',
      title: 'नेपाल हेमोफिलिया सोसाइटी - हेमोफिलिया बिरामीहरूको प्रारम्भिक दर्ता तथा आधारभूत अभिलेख',
      columns: [
        { header: 'क्र.सं.', key: 'sn' },
        { header: 'Patient ID', key: 'code' },
        { header: 'बिरामीको पूरा नाम', key: 'name' },
        { header: 'फ्याक्टर प्रकार', key: 'factorType' },
      ],
      rows: [
        { sn: 1, code: 'HEP-2026-0001', name: 'Nabin Dhungel', factorType: 'Factor VIII' },
      ],
      headerColor: 'FF1E3A8A',
    };

    const sheet2: ExcelSheetDef = {
      sheetName: '२. फ्याक्टर मौज्दात अवस्था',
      title: 'केन्द्रीय कार्यालय - क्लटिङ फ्याक्टर औषधिको वर्तमान मौज्दात विवरण',
      columns: [
        { header: 'क्र.सं.', key: 'sn' },
        { header: 'कम्पनी', key: 'company' },
        { header: 'हाल बाँकी भाइल', key: 'current' },
        { header: 'हाल बाँकी IU', key: 'totalIu' },
      ],
      rows: [
        { sn: 1, company: 'Takeda', current: 150, totalIu: 150000 },
      ],
      headerColor: 'FF0F766E',
    };

    const sheet3: ExcelSheetDef = {
      sheetName: '३. स्याटेलाइट स्टक',
      title: 'क्षेत्रीय स्याटेलाइट कार्यालयहरूमा मौज्दात फ्याक्टर औषधिको विवरण',
      columns: [
        { header: 'क्र.सं.', key: 'sn' },
        { header: 'स्याटेलाइट कार्यालय', key: 'office' },
        { header: 'हाल बाँकी भाइल', key: 'current' },
        { header: 'हाल बाँकी IU', key: 'totalIu' },
      ],
      rows: [
        { sn: 1, office: 'विराटनगर', current: 30, totalIu: 30000 },
      ],
      headerColor: 'FF6B21A8',
    };

    const sheet4: ExcelSheetDef = {
      sheetName: '४. बिरामी औषधि प्रयोग विवरण',
      title: 'बिरामीअनुसार फ्याक्टर औषधि प्रयोग, मिति, ब्याच तथा प्रयोजन विवरण',
      columns: [
        { header: 'क्र.सं.', key: 'sn' },
        { header: 'बिरामीको पूरा नाम', key: 'patientName' },
        { header: 'Patient ID', key: 'patientCode' },
        { header: 'प्रयोग मिति', key: 'date' },
        { header: 'प्रयोग भएको भाइल', key: 'vials' },
        { header: 'कुल प्रयोग IU', key: 'totalIu' },
        { header: 'प्रयोगको प्रयोजन', key: 'purposes' },
      ],
      rows: [
        {
          sn: 1,
          patientName: 'Nabin Dhungel',
          patientCode: 'HEP-2026-0001',
          date: '2026-02-15',
          vials: 2,
          totalIu: 1000,
          purposes: 'दायाँ घुँडा रक्तश्राव (Joint Bleed)',
        },
      ],
      headerColor: 'FF9F1239',
    };

    const buffer = await generateMultiSheetWorkbook([sheet1, sheet2, sheet3, sheet4]);
    expect(buffer).toBeDefined();
    expect(buffer.length).toBeGreaterThan(2000);

    // Load back with ExcelJS to inspect internal worksheets
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    expect(workbook.worksheets.length).toBe(4);
    expect(workbook.worksheets[0].name).toBe('१. बिरामी अभिलेखीकरण');
    expect(workbook.worksheets[1].name).toBe('२. फ्याक्टर मौज्दात अवस्था');
    expect(workbook.worksheets[2].name).toBe('३. स्याटेलाइट स्टक');
    expect(workbook.worksheets[3].name).toBe('४. बिरामी औषधि प्रयोग विवरण');

    // Verify cell content in sheet 4 (patient usage log)
    const ws4 = workbook.getWorksheet('४. बिरामी औषधि प्रयोग विवरण');
    expect(ws4).toBeDefined();
    // Verify title and patient name
    const titleCell = ws4?.getCell('A1').value;
    expect(titleCell).toContain('बिरामीअनुसार फ्याक्टर औषधि प्रयोग');
  });
});
