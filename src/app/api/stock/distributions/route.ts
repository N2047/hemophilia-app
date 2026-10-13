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
    const officeFilter = searchParams.get('officeId');
    const patientFilter = searchParams.get('patientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: any = {};

    if (user.role === 'OFFICE_USER') {
      whereClause.officeId = user.officeId;
    } else if (officeFilter) {
      whereClause.officeId = officeFilter;
    }

    if (patientFilter) {
      whereClause.patientId = patientFilter;
    }

    if (startDate || endDate) {
      whereClause.distributionDate = {};
      if (startDate) whereClause.distributionDate.gte = new Date(startDate);
      if (endDate) whereClause.distributionDate.lte = new Date(endDate);
    }

    const distributions = await prisma.patientDistribution.findMany({
      where: whereClause,
      include: {
        patient: true,
        office: true,
        dispensedBy: { select: { id: true, name: true, username: true } },
        items: true,
      },
      orderBy: { distributionDate: 'desc' },
      take: 150,
    });

    return NextResponse.json({ success: true, data: distributions });
  } catch (error: any) {
    console.error('Distributions fetch error:', error);
    return NextResponse.json({ success: false, message: 'वितरण विवरण प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}
