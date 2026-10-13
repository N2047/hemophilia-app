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

      // Emergency Stock Alerts Calculation (Section Thresholds: Central F8 < 30000, Central F9 < 5000, Satellite F8 < 3000)
      const CENTRAL_F8_THRESHOLD = 30000;
      const CENTRAL_F9_THRESHOLD = 5000;
      const SATELLITE_F8_THRESHOLD = 3000;

      const centralF8Iu = factorWiseCentral['Factor VIII']?.iu || 0;
      const centralF8Vials = factorWiseCentral['Factor VIII']?.vials || 0;
      const isCentralF8Low = centralF8Iu < CENTRAL_F8_THRESHOLD;

      const centralF9Iu = factorWiseCentral['Factor IX']?.iu || 0;
      const centralF9Vials = factorWiseCentral['Factor IX']?.vials || 0;
      const isCentralF9Low = centralF9Iu < CENTRAL_F9_THRESHOLD;

      const allSatelliteOffices = await prisma.office.findMany({
        where: { isActive: true, isCentral: false },
        orderBy: { nameNepali: 'asc' },
      });

      const satelliteF8Stock: Record<
        string,
        { officeId: string; officeName: string; factor8Iu: number; factor8Vials: number }
      > = {};
      for (const off of allSatelliteOffices) {
        satelliteF8Stock[off.id] = {
          officeId: off.id,
          officeName: off.nameNepali,
          factor8Iu: 0,
          factor8Vials: 0,
        };
      }

      for (const ob of officeBatches) {
        const isF8 =
          (ob.product.factorType || '').toLowerCase().includes('viii') ||
          ob.product.factorType === 'Factor VIII';
        if (isF8 && satelliteF8Stock[ob.officeId]) {
          satelliteF8Stock[ob.officeId].factor8Iu += ob.currentVials * ob.capacityIu;
          satelliteF8Stock[ob.officeId].factor8Vials += ob.currentVials;
        }
      }

      const lowStockSatellites = Object.values(satelliteF8Stock).filter(
        (s) => s.factor8Iu < SATELLITE_F8_THRESHOLD
      );

      const emergencyAlerts = {
        hasEmergency: isCentralF8Low || isCentralF9Low || lowStockSatellites.length > 0,
        centralF8: {
          isLow: isCentralF8Low,
          currentIu: centralF8Iu,
          currentVials: centralF8Vials,
          thresholdIu: CENTRAL_F8_THRESHOLD,
          factorName: 'Factor VIII',
          deficitIu: Math.max(0, CENTRAL_F8_THRESHOLD - centralF8Iu),
        },
        centralF9: {
          isLow: isCentralF9Low,
          currentIu: centralF9Iu,
          currentVials: centralF9Vials,
          thresholdIu: CENTRAL_F9_THRESHOLD,
          factorName: 'Factor IX',
          deficitIu: Math.max(0, CENTRAL_F9_THRESHOLD - centralF9Iu),
        },
        satelliteF8List: lowStockSatellites.map((s) => ({
          officeId: s.officeId,
          officeName: s.officeName,
          factorName: 'Factor VIII',
          currentIu: s.factor8Iu,
          currentVials: s.factor8Vials,
          thresholdIu: SATELLITE_F8_THRESHOLD,
          deficitIu: Math.max(0, SATELLITE_F8_THRESHOLD - s.factor8Iu),
        })),
        allSatellitesF8: Object.values(satelliteF8Stock),
      };

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
        emergencyAlerts,
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

      // Emergency Stock Alert for Satellite (Threshold: Factor VIII < 3000 IU; Factor IX is exempted per user spec)
      const SATELLITE_F8_THRESHOLD = 3000;
      const officeF8Iu = factorWiseOffice['Factor VIII']?.iu || 0;
      const officeF8Vials = factorWiseOffice['Factor VIII']?.vials || 0;
      const isOfficeF8Low = officeF8Iu < SATELLITE_F8_THRESHOLD;

      const currentOffice = await prisma.office.findUnique({
        where: { id: officeId },
        select: { nameNepali: true },
      });

      const emergencyAlerts = {
        hasEmergency: isOfficeF8Low,
        satelliteF8: {
          isLow: isOfficeF8Low,
          officeId,
          officeName: currentOffice?.nameNepali || user.officeName || 'स्याटेलाइट कार्यालय',
          factorName: 'Factor VIII',
          currentIu: officeF8Iu,
          currentVials: officeF8Vials,
          thresholdIu: SATELLITE_F8_THRESHOLD,
          deficitIu: Math.max(0, SATELLITE_F8_THRESHOLD - officeF8Iu),
        },
      };

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
        emergencyAlerts,
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
