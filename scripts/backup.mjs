import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`📦 Starting Automated Database Backup (${timestamp})...`);

  // Export all tables
  const [
    offices,
    users,
    companies,
    products,
    productCapacities,
    centralStockBatches,
    centralStockEntries,
    stockTransfers,
    stockTransferItems,
    officeStockBatches,
    patients,
    patientDistributions,
    patientDistributionItems,
    purposes,
    auditLogs,
    settings,
  ] = await Promise.all([
    prisma.office.findMany(),
    prisma.user.findMany(),
    prisma.company.findMany(),
    prisma.product.findMany(),
    prisma.productCapacity.findMany(),
    prisma.centralStockBatch.findMany(),
    prisma.centralStockEntry.findMany(),
    prisma.stockTransfer.findMany(),
    prisma.stockTransferItem.findMany(),
    prisma.officeStockBatch.findMany(),
    prisma.patient.findMany(),
    prisma.patientDistribution.findMany(),
    prisma.patientDistributionItem.findMany(),
    prisma.distributionPurposeMaster.findMany(),
    prisma.auditLog.findMany(),
    prisma.systemSetting.findMany(),
  ]);

  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      appName: 'Hemophilia Factor Management System',
      version: '1.0.0',
    },
    tables: {
      offices,
      users,
      companies,
      products,
      productCapacities,
      centralStockBatches,
      centralStockEntries,
      stockTransfers,
      stockTransferItems,
      officeStockBatches,
      patients,
      patientDistributions,
      patientDistributionItems,
      purposes,
      auditLogs,
      settings,
    },
  };

  const backupJson = JSON.stringify(backupData, null, 2);
  const backupFilePath = path.join(backupDir, `hemo_backup_${timestamp}.json`);
  fs.writeFileSync(backupFilePath, backupJson, 'utf-8');

  // Generate SHA-256 Checksum
  const checksum = crypto.createHash('sha256').update(backupJson).digest('hex');
  const checksumFilePath = path.join(backupDir, `hemo_backup_${timestamp}.sha256`);
  fs.writeFileSync(checksumFilePath, checksum, 'utf-8');

  console.log(`✅ Backup successfully created at: ${backupFilePath}`);
  console.log(`🔒 SHA256 Checksum: ${checksum}`);
}

runBackup()
  .catch((e) => {
    console.error('❌ Backup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
