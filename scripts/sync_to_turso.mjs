import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Load .env if present
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...v] = trimmed.split('=');
      const val = v.join('=').replace(/^["']|["']$/g, '');
      if (!process.env[k]) {
        process.env[k] = val;
      }
    }
  }
}

const TURSO_URL =
  process.env.TURSO_DATABASE_URL ||
  process.argv[3] ||
  'libsql://hemophilia-data-n2047.turso.io';

const TURSO_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  process.argv[2] ||
  '';

async function main() {
  console.log('🚀 Hemophilia App -> Turso Cloud Database Backup / Sync Tool');
  console.log(`📡 Target Turso URL: ${TURSO_URL}`);

  if (!TURSO_TOKEN) {
    console.error('\n❌ ERROR: Turso Auth Token आवश्यक छ!');
    console.log('\nप्रयोग गर्ने तरिका:');
    console.log('  node scripts/sync_to_turso.mjs <तपाईंको_TURSO_TOKEN>');
    console.log('वा .env फाइलमा TURSO_AUTH_TOKEN="तपाईंको_टोकन" राख्नुहोस्।');
    console.log('\nटोकन प्राप्त गर्ने तरिका:');
    console.log('  १. ब्राउजरमा https://app.turso.tech/n2047/databases/hemophilia-data खोल्नुहोस्।');
    console.log('  २. "Generate Token" वा "Connect" मा क्लिक गर्नुहोस्।');
    console.log('  ३. प्राप्त भएको Token कपी गरेर यहाँ चलाउनुहोस्।\n');
    process.exit(1);
  }

  const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (!fs.existsSync(localDbPath)) {
    console.error(`❌ Local SQLite file not found at ${localDbPath}`);
    process.exit(1);
  }

  console.log('📦 Connecting to local SQLite database...');
  const localClient = createClient({ url: `file:${localDbPath}` });

  console.log('☁️ Connecting to Turso Cloud database...');
  const tursoClient = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  // Test Turso connection
  try {
    const ping = await tursoClient.execute('SELECT 1 as test');
    console.log('✅ Connected to Turso successfully!');
  } catch (err) {
    console.error('❌ Failed to connect to Turso. कृपया Token र URL जाँच्नुहोस्:', err.message);
    process.exit(1);
  }

  // 1. Get Tables
  const tablesResult = await localClient.execute(
    `SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY name ASC`
  );

  console.log(`\n📋 Found ${tablesResult.rows.length} tables in local database:`);

  // Foreign keys off during bulk import
  try {
    await tursoClient.execute('PRAGMA foreign_keys = OFF;');
  } catch (e) {}

  // Create tables and sync data
  for (const row of tablesResult.rows) {
    const tableName = row.name;
    const tableSql = row.sql;

    console.log(`\n🔹 Processing table: ${tableName}...`);

    // Create table if not exists
    const safeSql = tableSql.replace(/^CREATE TABLE /i, 'CREATE TABLE IF NOT EXISTS ');
    try {
      await tursoClient.execute(safeSql);
    } catch (e) {
      // Table already exists
    }

    // Fetch local data
    const localData = await localClient.execute(`SELECT * FROM "${tableName}"`);
    console.log(`   Local records: ${localData.rows.length}`);

    if (localData.rows.length > 0) {
      const columns = Object.keys(localData.rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const colList = columns.map((c) => `"${c}"`).join(', ');
      const insertSql = `INSERT OR REPLACE INTO "${tableName}" (${colList}) VALUES (${placeholders})`;

      let insertedCount = 0;
      // Batch in chunks of 50
      const chunkSize = 50;
      for (let i = 0; i < localData.rows.length; i += chunkSize) {
        const chunk = localData.rows.slice(i, i + chunkSize);
        const statements = chunk.map((r) => ({
          sql: insertSql,
          args: columns.map((c) => r[c]),
        }));

        await tursoClient.batch(statements);
        insertedCount += chunk.length;
      }
      console.log(`   ✅ Synced ${insertedCount} rows to Turso.`);
    } else {
      console.log(`   (Table is empty, schema created)`);
    }
  }

  // 2. Indexes
  const indexesResult = await localClient.execute(
    `SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%'`
  );
  console.log(`\n📑 Creating ${indexesResult.rows.length} indexes...`);
  for (const row of indexesResult.rows) {
    try {
      await tursoClient.execute(row.sql);
    } catch (e) {
      // index might already exist
    }
  }

  try {
    await tursoClient.execute('PRAGMA foreign_keys = ON;');
  } catch (e) {}

  console.log('\n🎉 ==========================================');
  console.log('✅ सम्पूर्ण डेटाबेस Turso Cloud मा सफलतापूर्वक ब्याकअप भयो!');
  console.log(`🔗 Database URL: ${TURSO_URL}`);
  console.log('==========================================\n');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
