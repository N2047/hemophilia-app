import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    // Only Super Admin can view full Central Stock Batches
    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केन्द्रीय स्टक हेर्ने अधिकार छैन।' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId') || undefined;
    const factorType = searchParams.get('factorType') || undefined;
    const availableOnly = searchParams.get('availableOnly') === 'true';

    const now = new Date();
    const whereClause: any = {};

    if (availableOnly) {
      whereClause.currentVials = { gt: 0 };
      whereClause.isQuarantined = false;
      whereClause.expiryDate = { gt: now };
    }

    if (companyId) {
      whereClause.companyId = companyId;
    }

    if (factorType) {
      whereClause.product = { factorType };
    }

    const batches = await prisma.centralStockBatch.findMany({
      where: whereClause,
      include: {
        company: true,
        product: true,
      },
      orderBy: [{ expiryDate: 'asc' }, { createdAt: 'desc' }],
    });

    const formatted = batches.map((b) => ({
      ...b,
      currentIu: b.currentVials * b.capacityIu,
      isExpired: b.expiryDate <= now,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Central stock fetch error:', error);
    return NextResponse.json({ success: false, message: 'केन्द्रीय स्टक प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच: केन्द्रीय स्टक मेटाउने अधिकार छैन।' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('id');
    const batchNumberParam = searchParams.get('batchNumber');
    if (!batchId && !batchNumberParam) {
      return NextResponse.json({ success: false, message: 'स्टक ब्याचको ID वा ब्याच नम्बर आवश्यक छ।' }, { status: 400 });
    }

    let batch = null;
    if (batchId) {
      batch = await prisma.centralStockBatch.findUnique({
        where: { id: batchId },
        include: {
          company: true,
          product: true,
          transferItems: true,
        },
      });
    }

    if (!batch && batchNumberParam) {
      batch = await prisma.centralStockBatch.findFirst({
        where: { batchNumber: batchNumberParam },
        include: {
          company: true,
          product: true,
          transferItems: true,
        },
      });
    }

    if (!batch && batchId) {
      batch = await prisma.centralStockBatch.findFirst({
        where: { batchNumber: batchId },
        include: {
          company: true,
          product: true,
          transferItems: true,
        },
      });
    }

    if (!batch) {
      // Check if it exists in officeStockBatch
      if (batchId) {
        const officeBatch = await prisma.officeStockBatch.findUnique({
          where: { id: batchId },
        });
        if (officeBatch) {
          await prisma.patientDistributionItem.deleteMany({
            where: { officeStockBatchId: batchId },
          });
          await prisma.officeStockBatch.delete({
            where: { id: batchId },
          });
          return NextResponse.json({
            success: true,
            message: 'स्टक ब्याच सफलतापूर्वक हटाइयो।',
          });
        }
      }

      // If already deleted or not in database, return success so frontend removes it smoothly
      return NextResponse.json({
        success: true,
        message: 'यो ब्याच डेटाबेसमा पहिल्यै हटिसकेको छ वा फेला परेन। सूचीबाट सफलतापूर्वक हटाइयो।',
      });
    }

    const targetId = batch.id;

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated transfer items
      await tx.stockTransferItem.deleteMany({
        where: { centralStockBatchId: targetId },
      });

      // 2. Delete entry logs for this batch
      await tx.centralStockEntry.deleteMany({
        where: {
          productId: batch.productId,
          batchNumber: batch.batchNumber,
        },
      });

      // 3. Delete the central stock batch
      await tx.centralStockBatch.delete({
        where: { id: targetId },
      });

      // 4. Clean up any transfers that now have 0 items
      const emptyTransfers = await tx.stockTransfer.findMany({
        where: { items: { none: {} } },
        select: { id: true },
      });
      if (emptyTransfers.length > 0) {
        await tx.stockTransfer.deleteMany({
          where: { id: { in: emptyTransfers.map((t) => t.id) } },
        });
      }
    });

    await createAuditLog({
      user,
      action: 'STOCK_BATCH_DELETED',
      entityType: 'CentralStockBatch',
      entityId: targetId,
      details: {
        batchNumber: batch.batchNumber,
        productName: batch.product.name,
        companyName: batch.company.name,
        currentVials: batch.currentVials,
      },
      reason: 'प्रयोगकर्ताद्वारा अनावश्यक स्टक ब्याच हटाइयो',
    });

    return NextResponse.json({
      success: true,
      message: `ब्याच नं. ${batch.batchNumber} को स्टक तथ्यांक सफलतापूर्वक हटाइयो।`,
    });
  } catch (error: any) {
    console.error('Central stock batch delete error:', error);
    return NextResponse.json({ success: false, message: `स्टक ब्याच मेटाउँदा समस्या आयो: ${error.message || error}` }, { status: 500 });
  }
}

