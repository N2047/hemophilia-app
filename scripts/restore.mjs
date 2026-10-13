import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runRestore(backupFileName) {
  if (!backupFileName) {
    console.error('Usage: node scripts/restore.mjs <backup-file-name.json>');
    process.exit(1);
  }

  const backupDir = path.join(process.cwd(), 'backups');
  const backupFilePath = path.isAbsolute(backupFileName)
    ? backupFileName
    : path.join(backupDir, backupFileName);

  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Backup file not found: ${backupFilePath}`);
    process.exit(1);
  }

  // Checksum verification
  const checksumFilePath = backupFilePath.replace(/\.json$/, '.sha256');
  const content = fs.readFileSync(backupFilePath, 'utf-8');

  if (fs.existsSync(checksumFilePath)) {
    const expectedChecksum = fs.readFileSync(checksumFilePath, 'utf-8').trim();
    const actualChecksum = crypto.createHash('sha256').update(content).digest('hex');

    if (expectedChecksum !== actualChecksum) {
      console.error('❌ Checksum verification failed! File may be corrupt or tampered.');
      process.exit(1);
    }
    console.log('🔒 SHA256 Checksum verified successfully.');
  }

  const backupData = JSON.parse(content);
  console.log(`♻️ Restoring database from: ${backupData.metadata.timestamp}...`);

  await prisma.$transaction(async (tx) => {
    // Restore master offices
    for (const office of backupData.tables.offices) {
      await tx.office.upsert({
        where: { id: office.id },
        update: office,
        create: office,
      });
    }

    // Restore companies
    for (const company of backupData.tables.companies) {
      await tx.company.upsert({
        where: { id: company.id },
        update: company,
        create: company,
      });
    }

    // Restore products
    for (const prod of backupData.tables.products) {
      await tx.product.upsert({
        where: { id: prod.id },
        update: prod,
        create: prod,
      });
    }

    // Restore capacities
    for (const cap of backupData.tables.productCapacities) {
      await tx.productCapacity.upsert({
        where: { id: cap.id },
        update: cap,
        create: cap,
      });
    }

    // Restore patients
    for (const patient of backupData.tables.patients) {
      const pData = {
        ...patient,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : null,
        createdAt: new Date(patient.createdAt),
        updatedAt: new Date(patient.updatedAt),
      };
      await tx.patient.upsert({
        where: { id: patient.id },
        update: pData,
        create: pData,
      });
    }
  });

  console.log('🎉 Database restoration completed successfully!');
}

const targetFile = process.argv[2];
runRestore(targetFile)
  .catch((e) => {
    console.error('❌ Restore error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
