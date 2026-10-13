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
