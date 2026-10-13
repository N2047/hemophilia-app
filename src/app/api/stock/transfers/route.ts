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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच: ट्रान्सफर मेटाउने अधिकार Super Admin लाई मात्र छ।' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const transferId = searchParams.get('id');
    if (!transferId) {
      return NextResponse.json({ success: false, message: 'ट्रान्सफर ID आवश्यक छ।' }, { status: 400 });
    }

    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: transferId },
      include: {
        destinationOffice: true,
        items: true,
      },
    });

    if (!transfer) {
      return NextResponse.json({ success: false, message: 'स्टक ट्रान्सफर फेला परेन।' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Restore central batches and adjust destination office batches
      for (const item of transfer.items) {
        // Restore central batch
        try {
          await tx.centralStockBatch.update({
            where: { id: item.centralStockBatchId },
            data: {
              transferredVials: { decrement: item.vialCount },
              currentVials: { increment: item.vialCount },
            },
          });
        } catch (e) {}

        // Reduce or clean destination office batch
        try {
          const officeBatch = await tx.officeStockBatch.findFirst({
            where: {
              officeId: transfer.destinationOfficeId,
              batchNumber: item.batchNumber,
              capacityIu: item.capacityIu,
            },
          });
          if (officeBatch) {
            if (officeBatch.currentVials <= item.vialCount && officeBatch.distributedVials === 0) {
              await tx.officeStockBatch.delete({ where: { id: officeBatch.id } });
            } else {
              await tx.officeStockBatch.update({
                where: { id: officeBatch.id },
                data: {
                  receivedVials: { decrement: item.vialCount },
                  currentVials: { decrement: item.vialCount },
                },
              });
            }
          }
        } catch (e) {}
      }

      // Delete items
      await tx.stockTransferItem.deleteMany({
        where: { stockTransferId: transferId },
      });

      // Delete transfer
      await tx.stockTransfer.delete({
        where: { id: transferId },
      });
    });

    return NextResponse.json({
      success: true,
      message: `स्टक ट्रान्सफर ${transfer.transferNumber} सफलतापूर्वक हटाइयो।`,
    });
  } catch (error: any) {
    console.error('Transfer delete error:', error);
    return NextResponse.json({ success: false, message: 'स्टक ट्रान्सफर मेटाउँदा समस्या आयो।' }, { status: 500 });
  }
}

