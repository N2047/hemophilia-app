import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createClient } from '@libsql/client';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केवल सुपर एडमिनलाई मात्र अधिकार छ।' }, { status: 403 });
    }

    const defaultUrl = process.env.TURSO_DATABASE_URL || 'libsql://hemophilia-data-n2047.turso.io';
    const hasToken = !!process.env.TURSO_AUTH_TOKEN;

    let isConnected = false;
    let testError = null;

    if (process.env.TURSO_AUTH_TOKEN) {
      try {
        const client = createClient({
          url: defaultUrl,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });
        await client.execute('SELECT 1 as test');
        isConnected = true;
      } catch (e: any) {
        testError = e.message;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        url: defaultUrl,
        hasToken,
        isConnected,
        testError,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केवल सुपर एडमिनलाई मात्र अधिकार छ।' }, { status: 403 });
    }

    const body = await req.json();
    const targetUrl =
      (body.url && body.url.trim()) ||
      process.env.TURSO_DATABASE_URL ||
      'libsql://hemophilia-data-n2047.turso.io';
    const authToken = (body.authToken && body.authToken.trim()) || process.env.TURSO_AUTH_TOKEN;

    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            'कृपया Turso Auth Token प्रविष्ट गर्नुहोस्। (https://app.turso.tech/n2047/databases/hemophilia-data मा गएर टोकन प्राप्त गर्नुहोस्)',
        },
        { status: 400 }
      );
    }

    const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (!fs.existsSync(localDbPath)) {
      return NextResponse.json(
        { success: false, message: 'स्थानीय SQLite dev.db डेटाबेस फेला परेन।' },
        { status: 500 }
      );
    }

    const localClient = createClient({ url: `file:${localDbPath}` });
    const tursoClient = createClient({ url: targetUrl, authToken });

    // Test connection
    try {
      await tursoClient.execute('SELECT 1 as test');
    } catch (e: any) {
      return NextResponse.json(
        {
          success: false,
          message: `Turso Cloud मा जडान हुन सकेन: ${e.message}। कृपया Token सही छ कि छैन जाँच्नुहोस्।`,
        },
        { status: 400 }
      );
    }

    // Temporarily turn off foreign keys for bulk insert
    try {
      await tursoClient.execute('PRAGMA foreign_keys = OFF;');
    } catch (e) {}

    // Get all tables
    const tablesResult = await localClient.execute(
      `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY name ASC`
    );

    let totalSyncedRows = 0;
    const tableSummary: Array<{ name: string; rows: number }> = [];

    for (const row of tablesResult.rows) {
      const tableName = String(row.name);
      const tableSql = String(row.sql);

      // Create table on Turso
      const safeSql = tableSql.replace(/^CREATE TABLE /i, 'CREATE TABLE IF NOT EXISTS ');
      try {
        await tursoClient.execute(safeSql);
      } catch (e) {}

      // Fetch rows
      const dataRes = await localClient.execute(`SELECT * FROM "${tableName}"`);
      if (dataRes.rows.length > 0) {
        const columns = Object.keys(dataRes.rows[0]);
        const placeholders = columns.map(() => '?').join(', ');
        const colList = columns.map((c) => `"${c}"`).join(', ');
        const insertSql = `INSERT OR REPLACE INTO "${tableName}" (${colList}) VALUES (${placeholders})`;

        const chunkSize = 50;
        for (let i = 0; i < dataRes.rows.length; i += chunkSize) {
          const chunk = dataRes.rows.slice(i, i + chunkSize);
          const statements = chunk.map((r) => ({
            sql: insertSql,
            args: columns.map((c) => r[c]),
          }));
          await tursoClient.batch(statements);
        }
        totalSyncedRows += dataRes.rows.length;
        tableSummary.push({ name: tableName, rows: dataRes.rows.length });
      } else {
        tableSummary.push({ name: tableName, rows: 0 });
      }
    }

    // Indexes
    const indexesResult = await localClient.execute(
      `SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'`
    );
    for (const idx of indexesResult.rows) {
      try {
        await tursoClient.execute(String(idx.sql));
      } catch (e) {}
    }

    try {
      await tursoClient.execute('PRAGMA foreign_keys = ON;');
    } catch (e) {}

    // Persist settings in SystemSetting
    await prisma.systemSetting.upsert({
      where: { key: 'TURSO_AUTH_TOKEN' },
      create: { key: 'TURSO_AUTH_TOKEN', value: authToken },
      update: { value: authToken },
    });
    await prisma.systemSetting.upsert({
      where: { key: 'TURSO_DATABASE_URL' },
      create: { key: 'TURSO_DATABASE_URL', value: targetUrl },
      update: { value: targetUrl },
    });

    process.env.TURSO_AUTH_TOKEN = authToken;
    process.env.TURSO_DATABASE_URL = targetUrl;

    return NextResponse.json({
      success: true,
      message: `Turso Cloud मा ${tablesResult.rows.length} वटा तालिका र ${totalSyncedRows} रेकर्ड सफलतापूर्वक ब्याकअप भयो!`,
      data: {
        targetUrl,
        tableCount: tablesResult.rows.length,
        totalSyncedRows,
        tables: tableSummary,
      },
    });
  } catch (error: any) {
    console.error('Turso backup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: `ब्याकअप गर्दा त्रुटि आयो: ${error.message || String(error)}`,
      },
      { status: 500 }
    );
  }
}
