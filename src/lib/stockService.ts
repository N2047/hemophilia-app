import { prisma } from './prisma';
import { SessionUser } from './auth';
import { createAuditLog } from './audit';

/**
 * Generate human-readable transaction IDs
 */
function generateReferenceNumber(prefix: string): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timeSuffix = Date.now().toString().slice(-4);
  return `${prefix}-${year}-${timeSuffix}${randomSuffix}`;
}

export interface CentralStockInInput {
  receiptDate: string;
  companyId: string;
  productId: string;
  capacityIu: number;
  vialCount: number;
  batchNumber: string;
  expiryDate: string;
  remarks?: string | null;
}

export interface StockTransferInput {
  transferDate: string;
  destinationOfficeId: string;
  remarks?: string | null;
  items: Array<{
    centralStockBatchId: string;
    vialCount: number;
  }>;
}

export interface PatientDistributionInput {
  distributionDate: string;
  patientId: string;
  officeId: string;
  prescribingClinician?: string | null;
  purposes: string[];
  purposeDetails?: string | null;
  remarks?: string | null;
  items: Array<{
    officeStockBatchId: string;
    vialCount: number;
  }>;
}

/**
 * 1. Central Stock Entry (औषधि प्राप्ति)
 */
export async function recordCentralStockEntry(input: CentralStockInInput, user: SessionUser) {
  if (user.role !== 'SUPER_ADMIN') {
    throw new Error('केन्द्रीय स्टक प्रविष्टि गर्ने अधिकार केवल Super Admin लाई मात्र छ।');
  }

  const receiptDateObj = new Date(input.receiptDate);
  const expiryDateObj = new Date(input.expiryDate);
  const now = new Date();
  const isQuarantined = expiryDateObj <= now;
  const totalIu = input.capacityIu * input.vialCount;

  return await prisma.$transaction(async (tx) => {
    // 1. Find or create central stock batch
    let batch = await tx.centralStockBatch.findUnique({
      where: {
        productId_capacityIu_batchNumber: {
          productId: input.productId,
          capacityIu: input.capacityIu,
          batchNumber: input.batchNumber.trim(),
        },
      },
    });

    if (!batch) {
      batch = await tx.centralStockBatch.create({
        data: {
          companyId: input.companyId,
          productId: input.productId,
          capacityIu: input.capacityIu,
          batchNumber: input.batchNumber.trim(),
          expiryDate: expiryDateObj,
          receivedVials: input.vialCount,
          transferredVials: 0,
          adjustedVials: 0,
          currentVials: input.vialCount,
          isQuarantined,
        },
      });
    } else {
      const newReceived = batch.receivedVials + input.vialCount;
      const newCurrent = newReceived - batch.transferredVials + batch.adjustedVials;
      batch = await tx.centralStockBatch.update({
        where: { id: batch.id },
        data: {
          receivedVials: newReceived,
          currentVials: newCurrent,
          expiryDate: expiryDateObj, // update to latest if changed
          isQuarantined: isQuarantined || batch.isQuarantined,
        },
      });
    }

    // 2. Create Stock Entry record
    const entry = await tx.centralStockEntry.create({
      data: {
        receiptDate: receiptDateObj,
        companyId: input.companyId,
        productId: input.productId,
        capacityIu: input.capacityIu,
        vialCount: input.vialCount,
        totalIu,
        batchNumber: input.batchNumber.trim(),
        expiryDate: expiryDateObj,
        remarks: input.remarks || null,
        createdById: user.id,
      },
      include: {
        company: true,
        product: true,
      },
    });

    // 3. Audit log
    await createAuditLog(
      {
        user,
        action: 'CENTRAL_STOCK_ENTRY',
        entityType: 'CentralStockEntry',
        entityId: entry.id,
        details: {
          batchId: batch.id,
          batchNumber: input.batchNumber,
          vialCount: input.vialCount,
          capacityIu: input.capacityIu,
          totalIu,
        },
      },
      tx
    );

    return entry;
  });
}

/**
 * 2. Central Stock Out / Transfer to Satellite Office (स्याटेलाइटमा औषधि पठाउने)
 */
export async function executeStockTransfer(input: StockTransferInput, user: SessionUser) {
  if (user.role !== 'SUPER_ADMIN') {
    throw new Error('स्याटेलाइटमा औषधि पठाउने (Stock Transfer) अधिकार केवल Super Admin लाई मात्र छ।');
  }

  const office = await prisma.office.findUnique({
    where: { id: input.destinationOfficeId },
  });
  if (!office) {
    throw new Error('तोकिएको गन्तव्य कार्यालय/स्याटेलाइट फेला परेन।');
  }

  const transferNumber = generateReferenceNumber('TRF');
  const transferDateObj = new Date(input.transferDate);
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    let transferTotalVials = 0;
    let transferTotalIu = 0;
    const transferItemsToCreate = [];

    for (const item of input.items) {
      if (item.vialCount <= 0) {
        throw new Error('भाइल संख्या कम्तीमा १ हुनुपर्छ।');
      }

      const centralBatch = await tx.centralStockBatch.findUnique({
        where: { id: item.centralStockBatchId },
        include: { company: true, product: true },
      });

      if (!centralBatch) {
        throw new Error(`केन्द्रीय स्टक ब्याच फेला परेन (ID: ${item.centralStockBatchId})।`);
      }

      if (centralBatch.isQuarantined || centralBatch.expiryDate <= now) {
        throw new Error(
          `ब्याच नम्बर ${centralBatch.batchNumber} को म्याद सकिएको वा Quarantined अवस्थामा छ। यो औषधि पठाउन मिल्दैन!`
        );
      }

      if (centralBatch.currentVials < item.vialCount) {
        throw new Error(
          `अपर्याप्त स्टक! ब्याच ${centralBatch.batchNumber} मा ${centralBatch.currentVials} भाइल मात्र बाँकी छ, तर ${item.vialCount} भाइल पठाउन खोजियो।`
        );
      }

      // Decrement central batch stock
      const updatedTransferred = centralBatch.transferredVials + item.vialCount;
      const updatedCurrent = centralBatch.receivedVials - updatedTransferred + centralBatch.adjustedVials;

      await tx.centralStockBatch.update({
        where: { id: centralBatch.id },
        data: {
          transferredVials: updatedTransferred,
          currentVials: updatedCurrent,
        },
      });

      // Find or create Office Stock Batch for destination office
      let officeBatch = await tx.officeStockBatch.findUnique({
        where: {
          officeId_productId_capacityIu_batchNumber: {
            officeId: input.destinationOfficeId,
            productId: centralBatch.productId,
            capacityIu: centralBatch.capacityIu,
            batchNumber: centralBatch.batchNumber,
          },
        },
      });

      if (!officeBatch) {
        officeBatch = await tx.officeStockBatch.create({
          data: {
            officeId: input.destinationOfficeId,
            companyId: centralBatch.companyId,
            productId: centralBatch.productId,
            capacityIu: centralBatch.capacityIu,
            batchNumber: centralBatch.batchNumber,
            expiryDate: centralBatch.expiryDate,
            receivedVials: item.vialCount,
            distributedVials: 0,
            adjustedVials: 0,
            currentVials: item.vialCount,
            isQuarantined: false,
          },
        });
      } else {
        const newOfficeReceived = officeBatch.receivedVials + item.vialCount;
        const newOfficeCurrent = newOfficeReceived - officeBatch.distributedVials + officeBatch.adjustedVials;

        await tx.officeStockBatch.update({
          where: { id: officeBatch.id },
          data: {
            receivedVials: newOfficeReceived,
            currentVials: newOfficeCurrent,
          },
        });
      }

      const itemTotalIu = centralBatch.capacityIu * item.vialCount;
      transferTotalVials += item.vialCount;
      transferTotalIu += itemTotalIu;

      transferItemsToCreate.push({
        centralStockBatchId: centralBatch.id,
        companyName: centralBatch.company.name,
        productName: centralBatch.product.name,
        factorType: centralBatch.product.factorType,
        capacityIu: centralBatch.capacityIu,
        batchNumber: centralBatch.batchNumber,
        expiryDate: centralBatch.expiryDate,
        vialCount: item.vialCount,
        totalIu: itemTotalIu,
      });
    }

    // Create StockTransfer master record
    const transfer = await tx.stockTransfer.create({
      data: {
        transferNumber,
        transferDate: transferDateObj,
        destinationOfficeId: input.destinationOfficeId,
        sentById: user.id,
        totalVials: transferTotalVials,
        totalIu: transferTotalIu,
        remarks: input.remarks || null,
        status: 'COMPLETED',
        items: {
          create: transferItemsToCreate,
        },
      },
      include: {
        items: true,
        destinationOffice: true,
      },
    });

    // Record Audit
    await createAuditLog(
      {
        user,
        action: 'STOCK_TRANSFER_OUT',
        entityType: 'StockTransfer',
        entityId: transfer.id,
        details: {
          transferNumber,
          destinationOffice: office.nameNepali,
          totalVials: transferTotalVials,
          totalIu: transferTotalIu,
          itemsCount: input.items.length,
        },
      },
      tx
    );

    return transfer;
  });
}

/**
 * 3. Patient Factor Distribution (बिरामीलाई औषधि वितरण)
 */
export async function executePatientDistribution(input: PatientDistributionInput, user: SessionUser) {
  // Authorization check: User must be Super Admin OR must belong to this specific office
  if (user.role !== 'SUPER_ADMIN' && user.officeId !== input.officeId) {
    throw new Error('तपाईंलाई आफ्नो कार्यालयबाहेक अन्य कार्यालयबाट औषधि वितरण गर्ने अधिकार छैन।');
  }

  const patient = await prisma.patient.findUnique({
    where: { id: input.patientId },
  });
  if (!patient || !patient.isActive) {
    throw new Error('बिरामी फेला परेन वा बिरामीको रेकर्ड निष्क्रिय छ।');
  }

  const office = await prisma.office.findUnique({
    where: { id: input.officeId },
  });
  if (!office) {
    throw new Error('वितरण कार्यालय फेला परेन।');
  }

  const voucherNumber = generateReferenceNumber('DIST');
  const distributionDateObj = new Date(input.distributionDate);
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    let distributionTotalVials = 0;
    let distributionTotalIu = 0;
    const distributionItemsToCreate = [];

    for (const item of input.items) {
      if (item.vialCount <= 0) {
        throw new Error('भाइल संख्या कम्तीमा १ हुनुपर्छ।');
      }

      const officeBatch = await tx.officeStockBatch.findUnique({
        where: { id: item.officeStockBatchId },
        include: { company: true, product: true },
      });

      if (!officeBatch) {
        throw new Error(`कार्यालयको स्टक ब्याच फेला परेन (ID: ${item.officeStockBatchId})।`);
      }

      if (officeBatch.officeId !== input.officeId) {
        throw new Error('यो औषधि ब्याच तोकिएको कार्यालयको स्टकमा छैन।');
      }

      if (officeBatch.isQuarantined || officeBatch.expiryDate <= now) {
        throw new Error(
          `ब्याच ${officeBatch.batchNumber} को म्याद समाप्त भइसकेको छ (${officeBatch.expiryDate.toISOString().slice(0, 10)})। म्याद सकिएको औषधि बिरामीलाई दिन मिल्दैन!`
        );
      }

      if (officeBatch.currentVials < item.vialCount) {
        throw new Error(
          `अपर्याप्त कार्यालय स्टक! ब्याच ${officeBatch.batchNumber} मा ${officeBatch.currentVials} भाइल मात्र बाँकी छ, तर ${item.vialCount} वितरण गर्न खोजियो।`
        );
      }

      // Decrement office batch stock
      const newDistributed = officeBatch.distributedVials + item.vialCount;
      const newCurrent = officeBatch.receivedVials - newDistributed + officeBatch.adjustedVials;

      await tx.officeStockBatch.update({
        where: { id: officeBatch.id },
        data: {
          distributedVials: newDistributed,
          currentVials: newCurrent,
        },
      });

      const itemTotalIu = officeBatch.capacityIu * item.vialCount;
      distributionTotalVials += item.vialCount;
      distributionTotalIu += itemTotalIu;

      distributionItemsToCreate.push({
        officeStockBatchId: officeBatch.id,
        companyName: officeBatch.company.name,
        productName: officeBatch.product.name,
        factorType: officeBatch.product.factorType,
        capacityIu: officeBatch.capacityIu,
        batchNumber: officeBatch.batchNumber,
        expiryDate: officeBatch.expiryDate,
        vialCount: item.vialCount,
        totalIu: itemTotalIu,
      });
    }

    // Create PatientDistribution record
    const distribution = await tx.patientDistribution.create({
      data: {
        voucherNumber,
        distributionDate: distributionDateObj,
        patientId: input.patientId,
        officeId: input.officeId,
        dispensedById: user.id,
        prescribingClinician: input.prescribingClinician || null,
        purposes: JSON.stringify(input.purposes),
        purposeDetails: input.purposeDetails || null,
        totalVials: distributionTotalVials,
        totalIu: distributionTotalIu,
        remarks: input.remarks || null,
        items: {
          create: distributionItemsToCreate,
        },
      },
      include: {
        items: true,
        patient: true,
        office: true,
      },
    });

    // Record Audit
    await createAuditLog(
      {
        user,
        action: 'PATIENT_DISTRIBUTION',
        entityType: 'PatientDistribution',
        entityId: distribution.id,
        details: {
          voucherNumber,
          patientCode: patient.patientCode,
          patientName: patient.fullName,
          office: office.nameNepali,
          totalVials: distributionTotalVials,
          totalIu: distributionTotalIu,
          purposes: input.purposes,
        },
      },
      tx
    );

    return distribution;
  });
}
