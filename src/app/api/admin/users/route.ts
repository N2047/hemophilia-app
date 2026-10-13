import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'अनुमति छैन।' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: { office: true },
      orderBy: { createdAt: 'desc' },
    });

    const sanitized = users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      officeId: u.officeId,
      officeName: u.office?.nameNepali || null,
      isActive: u.isActive,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'प्रयोगकर्ता सूची प्राप्त भएन।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'अनुमति छैन।' }, { status: 403 });
    }

    const body = await req.json();
    const { username, name, password, role, officeId } = body;

    if (!username || !name || !password || !role) {
      return NextResponse.json({ success: false, message: 'सबै अनिवार्य फिल्ड भर्नुहोस्।' }, { status: 400 });
    }

    if (role === 'OFFICE_USER' && !officeId) {
      return NextResponse.json({ success: false, message: 'कार्यालय प्रयोगकर्ताका लागि कार्यालय छान्नुहोस्।' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ success: false, message: 'यो प्रयोगकर्ता नाम पहिले नै दर्ता छ।' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const created = await prisma.user.create({
      data: {
        username: username.trim().toLowerCase(),
        name: name.trim(),
        passwordHash,
        role,
        officeId: role === 'OFFICE_USER' ? officeId : null,
        isActive: true,
      },
      include: { office: true },
    });

    await createAuditLog({
      user,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: created.id,
      details: { username: created.username, role: created.role, officeId: created.officeId },
    });

    return NextResponse.json({
      success: true,
      message: `नयाँ प्रयोगकर्ता ${created.name} सफलतापूर्वक सिर्जना गरियो।`,
      data: {
        id: created.id,
        username: created.username,
        name: created.name,
        role: created.role,
        officeId: created.officeId,
        isActive: created.isActive,
      },
    });
  } catch (error: any) {
    console.error('User creation error:', error);
    return NextResponse.json({ success: false, message: 'प्रयोगकर्ता सिर्जना गर्न सकिएन।' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'अनुमति छैन।' }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, password, role, officeId, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'User ID अनिवार्य छ।' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role) {
      updateData.role = role;
      updateData.officeId = role === 'OFFICE_USER' ? officeId : null;
    } else if (officeId !== undefined) {
      updateData.officeId = officeId || null;
    }
    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(password.trim());
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { office: true },
    });

    await createAuditLog({
      user,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: updated.id,
      details: { username: updated.username, isActive: updated.isActive },
    });

    return NextResponse.json({
      success: true,
      message: 'प्रयोगकर्ता विवरण अद्यावधिक गरियो।',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'अद्यावधिक गर्न सकिएन।' }, { status: 500 });
  }
}
