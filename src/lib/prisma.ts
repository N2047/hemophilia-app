import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import fs from 'fs';
import path from 'path';

function createPrismaInstance(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  // 1. If Turso credentials are provided, connect directly to Turso Cloud
  if (tursoUrl && tursoAuthToken) {
    try {
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoAuthToken,
      });
      const adapter = new PrismaLibSQL(libsql);
      return new PrismaClient({
        adapter: adapter as any,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      });
    } catch (e) {
      console.error('Failed to initialize Turso adapter, falling back to local SQLite:', e);
    }
  }

  // 2. Vercel Serverless environment fallback (if Turso not yet configured)
  let dbUrl = process.env.DATABASE_URL;
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    const seedDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(seedDbPath)) {
          fs.copyFileSync(seedDbPath, tmpDbPath);
        }
      }
    } catch (err) {
      console.error('Error copying SQLite database to /tmp:', err);
    }

    dbUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = dbUrl;
  }

  // 3. Local SQLite database
  return new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaInstance();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


