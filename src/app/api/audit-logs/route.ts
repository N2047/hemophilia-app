import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'अनुमति छैन।' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const actionFilter = searchParams.get('action');
    const entityTypeFilter = searchParams.get('entityType');

    const whereClause: any = {};
    if (actionFilter) whereClause.action = actionFilter;
    if (entityTypeFilter) whereClause.entityType = entityTypeFilter;

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Audit Log प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}
