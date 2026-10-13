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

    const whereClause: any = {};

    if (user.role === 'OFFICE_USER') {
      whereClause.destinationOfficeId = user.officeId;
    } else if (officeFilter) {
      whereClause.destinationOfficeId = officeFilter;
    }

    const transfers = await prisma.stockTransfer.findMany({
      where: whereClause,
      include: {
        destinationOffice: true,
        sentBy: { select: { id: true, name: true, username: true } },
        items: true,
      },
      orderBy: { transferDate: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: transfers });
  } catch (error: any) {
    console.error('Transfers fetch error:', error);
    return NextResponse.json({ success: false, message: 'स्टक ट्रान्सफर विवरण प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}
