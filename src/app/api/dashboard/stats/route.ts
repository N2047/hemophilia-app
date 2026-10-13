import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच (Unauthorized)' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    const alertDaysAhead = 90;
    const expiryThresholdDate = new Date();
    expiryThresholdDate.setDate(now.getDate() + alertDaysAhead);

    const isSuperAdmin = user.role === 'SUPER_ADMIN';
    const officeId = user.officeId;

    if (isSuperAdmin) {
      // 1. Central Stock Batches
      const centralBatches = await prisma.centralStockBatch.findMany({
        where: { currentVials: { gt: 0 } },
        include: { company: true, product: true },
      });

      let totalCentralVials = 0;
      let totalCentralIu = 0;
      const factorWiseCentral: Record<string, { vials: number; iu: number }> = {};
      const lowStockBatches = [];
      const expiringSoonBatches = [];
      const expiredBatches = [];

      for (const b of centralBatches) {
        totalCentralVials += b.currentVials;
        const batchIu = b.currentVials * b.capacityIu;
        totalCentralIu += batchIu;

        const fType = b.product.factorType || 'Other';
        if (!factorWiseCentral[fType]) {
          factorWiseCentral[fType] = { vials: 0, iu: 0 };
        }
        factorWiseCentral[fType].vials += b.currentVials;
        factorWiseCentral[fType].iu += batchIu;

        if (b.currentVials <= 10) {
          lowStockBatches.push(b);
        }

        if (b.expiryDate <= now || b.isQuarantined) {
          expiredBatches.push(b);
        } else if (b.expiryDate <= expiryThresholdDate) {
          expiringSoonBatches.push(b);
        }
      }

      // 2. Office Stock breakdown
      const officeBatches = await prisma.officeStockBatch.findMany({
        where: { currentVials: { gt: 0 } },
        include: { office: true, product: true },
      });

      const officeWiseStock: Record<string, { officeName: string; vials: number; iu: number }> = {};
      for (const ob of officeBatches) {
        if (!officeWiseStock[ob.officeId]) {
          officeWiseStock[ob.officeId] = {
            officeName: ob.office.nameNepali,
            vials: 0,
            iu: 0,
          };
        }
        officeWiseStock[ob.officeId].vials += ob.currentVials;
        officeWiseStock[ob.officeId].iu += ob.currentVials * ob.capacityIu;
      }

      // 3. Counts & Totals
      const totalPatients = await prisma.patient.count({ where: { isActive: true } });
      const totalDistributions = await prisma.patientDistribution.count();
      const distributionAggregation = await prisma.patientDistribution.aggregate({
        _sum: { totalVials: true, totalIu: true },
      });

      // 4. Recent transactions
      const recentEntries = await prisma.centralStockEntry.findMany({
        take: 5,
        orderBy: { receiptDate: 'desc' },
        include: { company: true, product: true, createdBy: true },
      });

      const recentTransfers = await prisma.stockTransfer.findMany({
        take: 5,
        orderBy: { transferDate: 'desc' },
        include: { destinationOffice: true, sentBy: true },
      });

      const recentDistributions = await prisma.patientDistribution.findMany({
        take: 5,
        orderBy: { distributionDate: 'desc' },
        include: { patient: true, office: true, dispensedBy: true },
      });

      return NextResponse.json({
        success: true,
        role: 'SUPER_ADMIN',
        summary: {
          totalCentralVials,
          totalCentralIu,
          factorWiseCentral,
          officeWiseStock: Object.values(officeWiseStock),
          totalPatients,
          totalDistributions,
          totalDistributedVials: distributionAggregation._sum.totalVials || 0,
          totalDistributedIu: distributionAggregation._sum.totalIu || 0,
          lowStockCount: lowStockBatches.length,
          expiringSoonCount: expiringSoonBatches.length,
          expiredCount: expiredBatches.length,
        },
        alerts: {
          lowStockBatches,
          expiringSoonBatches,
          expiredBatches,
        },
        recentActivities: {
          recentEntries,
          recentTransfers,
          recentDistributions,
        },
      });
    } else {
      // Office / Satellite Dashboard
      if (!officeId) {
        return NextResponse.json(
          { success: false, message: 'प्रयोगकर्ताको कार्यालय तोकिएको छैन।' },
          { status: 400 }
        );
      }

      const officeBatches = await prisma.officeStockBatch.findMany({
        where: { officeId, currentVials: { gt: 0 } },
        include: { company: true, product: true, office: true },
      });

      let totalOfficeVials = 0;
      let totalOfficeIu = 0;
      const factorWiseOffice: Record<string, { vials: number; iu: number }> = {};
      const lowStockBatches = [];
      const expiringSoonBatches = [];
      const expiredBatches = [];

      for (const ob of officeBatches) {
        totalOfficeVials += ob.currentVials;
        const iu = ob.currentVials * ob.capacityIu;
        totalOfficeIu += iu;

        const fType = ob.product.factorType || 'Other';
        if (!factorWiseOffice[fType]) {
          factorWiseOffice[fType] = { vials: 0, iu: 0 };
        }
        factorWiseOffice[fType].vials += ob.currentVials;
        factorWiseOffice[fType].iu += iu;

        if (ob.currentVials <= 5) {
          lowStockBatches.push(ob);
        }

        if (ob.expiryDate <= now || ob.isQuarantined) {
          expiredBatches.push(ob);
        } else if (ob.expiryDate <= expiryThresholdDate) {
          expiringSoonBatches.push(ob);
        }
      }

      const recentReceivedTransfers = await prisma.stockTransfer.findMany({
        where: { destinationOfficeId: officeId },
        take: 5,
        orderBy: { transferDate: 'desc' },
        include: { items: true, sentBy: true },
      });

      const recentOfficeDistributions = await prisma.patientDistribution.findMany({
        where: { officeId },
        take: 5,
        orderBy: { distributionDate: 'desc' },
        include: { patient: true, items: true, dispensedBy: true },
      });

      const officeDistributionAgg = await prisma.patientDistribution.aggregate({
        where: { officeId },
        _sum: { totalVials: true, totalIu: true },
        _count: { id: true },
      });

      return NextResponse.json({
        success: true,
        role: 'OFFICE_USER',
        officeId,
        summary: {
          totalOfficeVials,
          totalOfficeIu,
          factorWiseOffice,
          totalDistributions: officeDistributionAgg._count.id || 0,
          totalDistributedVials: officeDistributionAgg._sum.totalVials || 0,
          totalDistributedIu: officeDistributionAgg._sum.totalIu || 0,
          lowStockCount: lowStockBatches.length,
          expiringSoonCount: expiringSoonBatches.length,
          expiredCount: expiredBatches.length,
        },
        alerts: {
          lowStockBatches,
          expiringSoonBatches,
          expiredBatches,
        },
        recentActivities: {
          recentTransfers: recentReceivedTransfers,
          recentDistributions: recentOfficeDistributions,
        },
      });
    }
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, message: 'ड्यासबोर्ड विवरण प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}
