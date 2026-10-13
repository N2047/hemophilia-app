import http from 'http';
import ExcelJS from 'exceljs';

const postData = JSON.stringify({ username: 'admin', password: 'Admin@Secure2026!' });
const loginReq = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
}, (res) => {
  const setCookie = res.headers['set-cookie'];
  const cookie = setCookie[0].split(';')[0];

  http.get({
    hostname: 'localhost',
    port: 3000,
    path: '/api/reports/export?type=master',
    headers: { Cookie: cookie },
  }, (expRes) => {
    const chunks = [];
    expRes.on('data', chunk => chunks.push(chunk));
    expRes.on('end', async () => {
      const buffer = Buffer.concat(chunks);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      console.log('Worksheet Count:', workbook.worksheets.length);
      workbook.worksheets.forEach((ws, i) => {
        console.log(`Sheet ${i + 1}: [${ws.name}] | Total Rows: ${ws.rowCount}`);
      });
      const ws4 = workbook.getWorksheet('४. बिरामी औषधि प्रयोग विवरण');
      if (ws4) {
        console.log('Sheet 4 Title (A1):', ws4.getCell('A1').value);
        console.log('Sheet 4 Headers (Row 3):', ws4.getRow(3).values.slice(1, 10));
        if (ws4.rowCount >= 4) {
          console.log('Sheet 4 Row 4 Sample (Patient):', ws4.getRow(4).values.slice(1, 7));
        }
      }
    });
  });
});
loginReq.write(postData);
loginReq.end();
