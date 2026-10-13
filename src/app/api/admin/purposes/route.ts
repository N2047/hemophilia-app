import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const purposes = await prisma.distributionPurposeMaster.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json({ success: true, data: purposes });
  } catch (error: any) {
    console.error('Fetch purposes error:', error);
    return NextResponse.json({ success: false, message: 'प्रयोजन सूची प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केवल सुपर एडमिनलाई मात्र अधिकार छ।' }, { status: 403 });
    }

    const body = await req.json();
    const { category, nameNepali, nameEnglish, sortOrder } = body;

    if (!nameNepali || !nameNepali.trim()) {
      return NextResponse.json({ success: false, message: 'प्रयोजनको नाम अनिवार्य छ।' }, { status: 400 });
    }

    const created = await prisma.distributionPurposeMaster.create({
      data: {
        category: category === 'NON_BLEED' ? 'NON_BLEED' : 'BLEED_SITE',
        nameNepali: nameNepali.trim(),
        nameEnglish: nameEnglish ? nameEnglish.trim() : nameNepali.trim(),
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 99,
        isActive: true,
      },
    });

    await createAuditLog({
      user,
      action: 'PURPOSE_CREATED',
      entityType: 'DistributionPurpose',
      entityId: created.id,
      details: { created },
      reason: 'नयाँ वितरण प्रयोजन थपियो',
    });

    return NextResponse.json({
      success: true,
      message: 'नयाँ वितरण प्रयोजन सफलतापूर्वक थपियो।',
      data: created,
    });
  } catch (error: any) {
    console.error('Create purpose error:', error);
    return NextResponse.json({ success: false, message: 'प्रयोजन थप्न सकिएन।' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केवल सुपर एडमिनलाई मात्र अधिकार छ।' }, { status: 403 });
    }

    const body = await req.json();
    const { id, category, nameNepali, nameEnglish, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'प्रयोजन ID आवश्यक छ।' }, { status: 400 });
    }

    const existing = await prisma.distributionPurposeMaster.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'प्रयोजन फेला परेन।' }, { status: 404 });
    }

    const updated = await prisma.distributionPurposeMaster.update({
      where: { id },
      data: {
        category: category !== undefined ? category : existing.category,
        nameNepali: nameNepali ? nameNepali.trim() : existing.nameNepali,
        nameEnglish: nameEnglish !== undefined ? nameEnglish.trim() : existing.nameEnglish,
        isActive: typeof isActive === 'boolean' ? isActive : existing.isActive,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : existing.sortOrder,
      },
    });

    await createAuditLog({
      user,
      action: 'PURPOSE_UPDATED',
      entityType: 'DistributionPurpose',
      entityId: updated.id,
      details: { previous: existing, updated },
      reason: 'वितरण प्रयोजन सम्पादन गरियो',
    });

    return NextResponse.json({
      success: true,
      message: 'वितरण प्रयोजन सफलतापूर्वक अद्यावधिक गरियो।',
      data: updated,
    });
  } catch (error: any) {
    console.error('Update purpose error:', error);
    return NextResponse.json({ success: false, message: 'प्रयोजन सम्पादन गर्न सकिएन।' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केवल सुपर एडमिनलाई मात्र अधिकार छ।' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'प्रयोजन ID आवश्यक छ।' }, { status: 400 });
    }

    const existing = await prisma.distributionPurposeMaster.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: 'प्रयोजन फेला परेन।' }, { status: 404 });
    }

    await prisma.distributionPurposeMaster.delete({ where: { id } });

    await createAuditLog({
      user,
      action: 'PURPOSE_DELETED',
      entityType: 'DistributionPurpose',
      entityId: id,
      details: { deleted: existing },
      reason: 'वितरण प्रयोजन हटाइयो',
    });

    return NextResponse.json({
      success: true,
      message: 'वितरण प्रयोजन सफलतापूर्वक हटाइयो।',
    });
  } catch (error: any) {
    console.error('Delete purpose error:', error);
    return NextResponse.json({ success: false, message: 'प्रयोजन हटाउन सकिएन।' }, { status: 500 });
  }
}
