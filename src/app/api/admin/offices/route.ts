import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const offices = await prisma.office.findMany({
      include: {
        _count: {
          select: { users: true, distributions: true },
        },
      },
      orderBy: { nameNepali: 'asc' },
    });
    return NextResponse.json({ success: true, data: offices });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'कार्यालय विवरण प्राप्त भएन।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'अनुमति छैन।' }, { status: 403 });
    }

    const body = await req.json();
    const { id, nameNepali, nameEnglish, district } = body;

    if (!id || !nameNepali || !nameEnglish || !district) {
      return NextResponse.json({ success: false, message: 'सबै अनिवार्य फिल्ड भर्नुहोस्।' }, { status: 400 });
    }

    const cleanId = id.trim().toUpperCase().replace(/\s+/g, '_');
    const existing = await prisma.office.findUnique({
      where: { id: cleanId },
    });

    if (existing) {
      return NextResponse.json({ success: false, message: 'यो Office ID पहिले नै दर्ता छ।' }, { status: 409 });
    }

    const created = await prisma.office.create({
      data: {
        id: cleanId,
        nameNepali: nameNepali.trim(),
        nameEnglish: nameEnglish.trim(),
        district: district.trim(),
        isCentral: false,
        isActive: true,
      },
    });

    await createAuditLog({
      user,
      action: 'OFFICE_CREATED',
      entityType: 'Office',
      entityId: created.id,
      details: { nameNepali: created.nameNepali, id: created.id },
    });

    return NextResponse.json({
      success: true,
      message: `नयाँ कार्यालय ${created.nameNepali} सफलतापूर्वक थपियो।`,
      data: created,
    });
  } catch (error: any) {
    console.error('Office creation error:', error);
    return NextResponse.json({ success: false, message: 'कार्यालय सिर्जना गर्न सकिएन।' }, { status: 500 });
  }
}
