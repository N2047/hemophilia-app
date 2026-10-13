import { describe, it, expect, beforeAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import {
  recordCentralStockEntry,
  executeStockTransfer,
  executePatientDistribution,
} from '../src/lib/stockService';
import { SessionUser } from '../src/lib/auth';

describe('Workflow & Integrity Automated Tests (Section 21 Requirements)', () => {
  let superAdminUser: SessionUser;
  let urlabariUser: SessionUser;
  let dhankutaUser: SessionUser;
  let testCompany: any;
  let testProduct: any;
  let testBatchNumber: string;

  beforeAll(async () => {
    // Fetch real seeded users
    const adminRecord = await prisma.user.findUnique({ where: { username: 'admin' } });
    const urlabariRecord = await prisma.user.findUnique({ where: { username: 'urlabari_user' } });
    const dhankutaRecord = await prisma.user.findUnique({ where: { username: 'dhankuta_user' } });

    superAdminUser = {
      id: adminRecord!.id,
      username: 'admin',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      officeId: null,
    };

    urlabariUser = {
      id: urlabariRecord!.id,
      username: 'urlabari_user',
      name: 'Urlabari User',
      role: 'OFFICE_USER',
      officeId: 'OFFICE_URLABARI',
    };

    dhankutaUser = {
      id: dhankutaRecord!.id,
      username: 'dhankuta_user',
      name: 'Dhankuta User',
      role: 'OFFICE_USER',
      officeId: 'OFFICE_DHANKUTA',
    };

    // Ensure company and product exist
    testCompany = await prisma.company.findFirst();
    if (!testCompany) {
      testCompany = await prisma.company.create({ data: { name: 'Test Company CSL' } });
    }

    testProduct = await prisma.product.findFirst({ where: { companyId: testCompany.id } });
    if (!testProduct) {
      testProduct = await prisma.product.create({
        data: {
          companyId: testCompany.id,
          name: 'Factor VIII Test',
          factorType: 'Factor VIII',
        },
      });
    }

    testBatchNumber = `BTH-TEST-${Date.now()}`;
  });

  it('B. Central Stock Receipt: Receives 20 vials of 500 IU (Total 10,000 IU)', async () => {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years in future

    const entry = await recordCentralStockEntry(
      {
        receiptDate: new Date().toISOString(),
        companyId: testCompany.id,
        productId: testProduct.id,
        capacityIu: 500,
        vialCount: 20,
        batchNumber: testBatchNumber,
        expiryDate: expiryDate.toISOString(),
        remarks: 'Test donation receipt',
      },
      superAdminUser
    );

    expect(entry).toBeDefined();
    expect(entry.vialCount).toBe(20);
    expect(entry.totalIu).toBe(10000); // 20 * 500 = 10,000 IU

    // Verify CentralStockBatch currentVials
    const batch = await prisma.centralStockBatch.findUnique({
      where: {
        productId_capacityIu_batchNumber: {
          productId: testProduct.id,
          capacityIu: 500,
          batchNumber: testBatchNumber,
        },
      },
    });

    expect(batch).toBeDefined();
    expect(batch?.currentVials).toBe(20);
  });

  it('B. Stock Transfer: Sends 8 vials to Urlabari Satellite', async () => {
    const centralBatch = await prisma.centralStockBatch.findUnique({
      where: {
        productId_capacityIu_batchNumber: {
          productId: testProduct.id,
          capacityIu: 500,
          batchNumber: testBatchNumber,
        },
      },
    });

    expect(centralBatch).toBeDefined();

    const transfer = await executeStockTransfer(
      {
        transferDate: new Date().toISOString(),
        destinationOfficeId: 'OFFICE_URLABARI',
        items: [{ centralStockBatchId: centralBatch!.id, vialCount: 8 }],
        remarks: 'Send 8 vials to Urlabari',
      },
      superAdminUser
    );

    expect(transfer).toBeDefined();
    expect(transfer.totalVials).toBe(8);
    expect(transfer.totalIu).toBe(4000); // 8 * 500 = 4,000 IU

    // Confirm Central Stock decreased to 12 vials (20 - 8 = 12)
    const updatedCentral = await prisma.centralStockBatch.findUnique({
      where: { id: centralBatch!.id },
    });
    expect(updatedCentral?.currentVials).toBe(12);

    // Confirm Urlabari stock increased to 8 vials
    const urlabariBatch = await prisma.officeStockBatch.findUnique({
      where: {
        officeId_productId_capacityIu_batchNumber: {
          officeId: 'OFFICE_URLABARI',
          productId: testProduct.id,
          capacityIu: 500,
          batchNumber: testBatchNumber,
        },
      },
    });
    expect(urlabariBatch).toBeDefined();
    expect(urlabariBatch?.currentVials).toBe(8);

    // Confirm Dhankuta stock did NOT receive those 8 vials (is 0 or non-existent)
    const dhankutaBatch = await prisma.officeStockBatch.findUnique({
      where: {
        officeId_productId_capacityIu_batchNumber: {
          officeId: 'OFFICE_DHANKUTA',
          productId: testProduct.id,
          capacityIu: 500,
          batchNumber: testBatchNumber,
        },
      },
    });
    expect(dhankutaBatch?.currentVials || 0).toBe(0);
  });

  it('C. Insufficient Stock Prevention: Attempting to send 15 vials when only 12 are available fails', async () => {
    const centralBatch = await prisma.centralStockBatch.findUnique({
      where: {
        productId_capacityIu_batchNumber: {
          productId: testProduct.id,
          capacityIu: 500,
          batchNumber: testBatchNumber,
        },
      },
    });

    await expect(
      executeStockTransfer(
        {
          transferDate: new Date().toISOString(),
          destinationOfficeId: 'OFFICE_DHANKUTA',
          items: [{ centralStockBatchId: centralBatch!.id, vialCount: 15 }],
        },
        superAdminUser
      )
    ).rejects.toThrow(/अपर्याप्त स्टक/);

    // Verify stock was not modified
    const currentCentral = await prisma.centralStockBatch.findUnique({
      where: { id: centralBatch!.id },
    });
    expect(currentCentral?.currentVials).toBe(12);
  });

  it('D. Patient Distribution: Dispenses from Urlabari stock, links to patient, and recalculates totals', async () => {
    // 1. Create a patient
    const patientCode = `HEP-TEST-${Date.now()}`;
    const patient = await prisma.patient.create({
      data: {
        patientCode,
        fullName: 'परीक्षण बिरामी (Test Patient)',
        age: 24,
        phone: '9800000000',
        bloodGroup: 'A+',
        province: 'कोशी प्रदेश',
        district: 'मोरङ',
        localLevel: 'उर्लाबारी नगरपालिका',
        wardNo: 3,
        factorType: 'Factor VIII',
        severity: 'SEVERE',
        registeredOfficeId: 'OFFICE_URLABARI',
      },
    });

    const urlabariBatch = await prisma.officeStockBatch.findUnique({
      where: {
        officeId_productId_capacityIu_batchNumber: {
          officeId: 'OFFICE_URLABARI',
          productId: testProduct.id,
          capacityIu: 500,
          batchNumber: testBatchNumber,
        },
      },
    });

    // 2. Dispense 3 vials
    const dist1 = await executePatientDistribution(
      {
        distributionDate: new Date().toISOString(),
        patientId: patient.id,
        officeId: 'OFFICE_URLABARI',
        purposes: ['जोर्नीमा रक्तस्राव (सामान्य)'],
        items: [{ officeStockBatchId: urlabariBatch!.id, vialCount: 3 }],
      },
      urlabariUser
    );

    expect(dist1).toBeDefined();
    expect(dist1.totalVials).toBe(3);
    expect(dist1.totalIu).toBe(1500);

    // Check Urlabari batch stock decreased to 5 (8 - 3 = 5)
    const updatedUrlabariBatch1 = await prisma.officeStockBatch.findUnique({
      where: { id: urlabariBatch!.id },
    });
    expect(updatedUrlabariBatch1?.currentVials).toBe(5);

    // 3. Dispense 2 more vials to the same patient on second visit
    const dist2 = await executePatientDistribution(
      {
        distributionDate: new Date().toISOString(),
        patientId: patient.id,
        officeId: 'OFFICE_URLABARI',
        purposes: ['नियमित रोकथाम (Prophylaxis)'],
        items: [{ officeStockBatchId: urlabariBatch!.id, vialCount: 2 }],
      },
      urlabariUser
    );

    expect(dist2).toBeDefined();
    expect(dist2.totalVials).toBe(2);

    // Check Urlabari batch stock decreased to 3 (5 - 2 = 3)
    const updatedUrlabariBatch2 = await prisma.officeStockBatch.findUnique({
      where: { id: urlabariBatch!.id },
    });
    expect(updatedUrlabariBatch2?.currentVials).toBe(3);

    // 4. Verify all distributions linked to the same Patient ID
    const patientDistributions = await prisma.patientDistribution.findMany({
      where: { patientId: patient.id },
    });
    expect(patientDistributions.length).toBe(2);
    const totalDispensedVials = patientDistributions.reduce((acc, d) => acc + d.totalVials, 0);
    const totalDispensedIu = patientDistributions.reduce((acc, d) => acc + d.totalIu, 0);
    expect(totalDispensedVials).toBe(5); // 3 + 2 = 5 vials
    expect(totalDispensedIu).toBe(2500); // 1500 + 1000 = 2500 IU
  });

  it('F. Tenant Isolation & Permissions: Dhankuta user cannot distribute from Urlabari stock', async () => {
    const patient = await prisma.patient.findFirst({ where: { registeredOfficeId: 'OFFICE_URLABARI' } });
    const urlabariBatch = await prisma.officeStockBatch.findFirst({ where: { officeId: 'OFFICE_URLABARI' } });

    await expect(
      executePatientDistribution(
        {
          distributionDate: new Date().toISOString(),
          patientId: patient!.id,
          officeId: 'OFFICE_URLABARI',
          purposes: ['जोर्नीमा रक्तस्राव'],
          items: [{ officeStockBatchId: urlabariBatch!.id, vialCount: 1 }],
        },
        dhankutaUser // Dhankuta user attempting to dispense from Urlabari
      )
    ).rejects.toThrow(/अन्य कार्यालयबाट औषधि वितरण गर्ने अधिकार छैन/);
  });

  it('F. Role Check: Office user cannot perform Super Admin Central Stock Entry', async () => {
    await expect(
      recordCentralStockEntry(
        {
          receiptDate: new Date().toISOString(),
          companyId: testCompany.id,
          productId: testProduct.id,
          capacityIu: 500,
          vialCount: 10,
          batchNumber: 'BTH-HACK',
          expiryDate: new Date().toISOString(),
        },
        urlabariUser // Regular office user
      )
    ).rejects.toThrow(/केवल Super Admin लाई मात्र/);
  });
});
