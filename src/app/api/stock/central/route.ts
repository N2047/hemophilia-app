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
    if (!batchId) {
      return NextResponse.json({ success: false, message: 'स्टक ब्याचको ID आवश्यक छ।' }, { status: 400 });
    }

    const batch = await prisma.centralStockBatch.findUnique({
      where: { id: batchId },
      include: {
        company: true,
        product: true,
        transferItems: true,
      },
    });

    if (!batch) {
      return NextResponse.json({ success: false, message: 'स्टक ब्याच फेला परेन।' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated transfer items
      await tx.stockTransferItem.deleteMany({
        where: { centralStockBatchId: batchId },
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
        where: { id: batchId },
      });
    });

    await createAuditLog({
      user,
      action: 'STOCK_BATCH_DELETED',
      entityType: 'CentralStockBatch',
      entityId: batchId,
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
    return NextResponse.json({ success: false, message: 'स्टक ब्याच मेटाउँदा समस्या आयो।' }, { status: 500 });
  }
}

