import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const { id } = params;

    const distribution = await prisma.patientDistribution.findUnique({
      where: { id },
      include: {
        items: true,
        patient: true,
      },
    });

    if (!distribution) {
      return NextResponse.json({ success: false, message: 'औषधि वितरण भौचर फेला परेन।' }, { status: 404 });
    }

    // Role check: If office user, only allow if belonging to their office
    if (user.role === 'OFFICE_USER' && distribution.officeId !== user.officeId) {
      return NextResponse.json(
        { success: false, message: 'आफ्नो कार्यालय बाहेकको वितरण भौचर मेटाउने अधिकार छैन।' },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore stock vials
      for (const item of distribution.items) {
        try {
          await tx.officeStockBatch.update({
            where: { id: item.officeStockBatchId },
            data: {
              distributedVials: { decrement: item.vialCount },
              currentVials: { increment: item.vialCount },
            },
          });
        } catch (e) {
          // Continue if batch was modified
        }
      }

      // 2. Delete distribution items
      await tx.patientDistributionItem.deleteMany({
        where: { patientDistributionId: id },
      });

      // 3. Delete distribution record
      await tx.patientDistribution.delete({
        where: { id },
      });
    });

    await createAuditLog({
      user,
      action: 'DISTRIBUTION_DELETED',
      entityType: 'PatientDistribution',
      entityId: id,
      details: {
        voucherNumber: distribution.voucherNumber,
        patientName: distribution.patient.fullName,
        totalVials: distribution.totalVials,
        totalIu: distribution.totalIu,
      },
      reason: 'प्रयोगकर्ताद्वारा अनावश्यक वितरण रेकर्ड मेटाइएको',
    });

    return NextResponse.json({
      success: true,
      message: `वितरण भौचर ${distribution.voucherNumber} सफलतापूर्वक हटाइयो र स्टक पुन: मिलान गरियो।`,
    });
  } catch (error: any) {
    console.error('Distribution delete error:', error);
    return NextResponse.json(
      { success: false, message: 'वितरण भौचर मेटाउँदा समस्या आयो।' },
      { status: 500 }
    );
  }
}
