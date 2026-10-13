import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reqOfficeId = searchParams.get('officeId');
    const availableOnly = searchParams.get('availableOnly') === 'true';

    // Strict Tenant Isolation Enforcement:
    let targetOfficeId: string;
    if (user.role === 'OFFICE_USER') {
      if (!user.officeId) {
        return NextResponse.json({ success: false, message: 'कार्यालय विवरण फेला परेन।' }, { status: 403 });
      }
      targetOfficeId = user.officeId;
    } else {
      // Super Admin can inspect specific office or all
      targetOfficeId = reqOfficeId || '';
    }

    const now = new Date();
    const whereClause: any = {};

    if (targetOfficeId) {
      whereClause.officeId = targetOfficeId;
    }

    if (availableOnly) {
      whereClause.currentVials = { gt: 0 };
      whereClause.isQuarantined = false;
      whereClause.expiryDate = { gt: now };
    }

    const batches = await prisma.officeStockBatch.findMany({
      where: whereClause,
      include: {
        office: true,
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

    return NextResponse.json({
      success: true,
      officeId: targetOfficeId,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Office stock fetch error:', error);
    return NextResponse.json({ success: false, message: 'कार्यालय स्टक प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('id');
    const batchNumberParam = searchParams.get('batchNumber');
    if (!batchId && !batchNumberParam) {
      return NextResponse.json({ success: false, message: 'स्टक ब्याचको ID वा ब्याच नम्बर आवश्यक छ।' }, { status: 400 });
    }

    let batch = null;
    if (batchId) {
      batch = await prisma.officeStockBatch.findUnique({
        where: { id: batchId },
        include: {
          office: true,
          company: true,
          product: true,
          distributionItems: true,
        },
      });
    }

    if (!batch && batchNumberParam) {
      batch = await prisma.officeStockBatch.findFirst({
        where: {
          batchNumber: batchNumberParam,
          officeId: user.role === 'OFFICE_USER' ? user.officeId! : undefined,
        },
        include: {
          office: true,
          company: true,
          product: true,
          distributionItems: true,
        },
      });
    }

    if (!batch) {
      return NextResponse.json({
        success: true,
        message: 'यो ब्याच डेटाबेसमा पहिल्यै हटिसकेको छ वा फेला परेन। सूचीबाट सफलतापूर्वक हटाइयो।',
      });
    }

    // Role check
    if (user.role === 'OFFICE_USER' && batch.officeId !== user.officeId) {
      return NextResponse.json({ success: false, message: 'अन्य कार्यालयको स्टक मेटाउने अधिकार छैन।' }, { status: 403 });
    }

    const targetId = batch.id;

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated distribution items
      await tx.patientDistributionItem.deleteMany({
        where: { officeStockBatchId: targetId },
      });

      // 2. Delete the office batch
      await tx.officeStockBatch.delete({
        where: { id: targetId },
      });
    });

    return NextResponse.json({
      success: true,
      message: `ब्याच नं. ${batch.batchNumber} को स्याटेलाइट स्टक तथ्यांक सफलतापूर्वक हटाइयो।`,
    });
  } catch (error: any) {
    console.error('Office stock batch delete error:', error);
    return NextResponse.json({ success: false, message: `स्टक ब्याच मेटाउँदा समस्या आयो: ${error.message || error}` }, { status: 500 });
  }
}

