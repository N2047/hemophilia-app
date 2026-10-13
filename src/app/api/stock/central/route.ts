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
