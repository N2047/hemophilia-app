import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// In Vercel Serverless environment, file system is read-only except /tmp
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  const seedDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  if (!fs.existsSync(tmpDbPath) && fs.existsSync(seedDbPath)) {
    try {
      fs.copyFileSync(seedDbPath, tmpDbPath);
      console.log('Successfully copied SQLite database to /tmp/dev.db');
    } catch (err) {
      console.error('Error copying SQLite database to /tmp:', err);
    }
  }

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

