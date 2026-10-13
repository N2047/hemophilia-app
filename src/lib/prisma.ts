import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let dbUrl = process.env.DATABASE_URL;

// In Vercel Serverless environment, file system is read-only except /tmp
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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

