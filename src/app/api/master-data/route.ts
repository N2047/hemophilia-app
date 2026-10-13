import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NEPAL_ADMINISTRATIVE_DATA } from '@/data/nepalAdministrativeData';

export async function GET(req: NextRequest) {
  try {
    const [offices, companies, products, capacities, purposes, systemSettings] = await Promise.all([
      prisma.office.findMany({
        where: { isActive: true },
        orderBy: { nameNepali: 'asc' },
      }),
      prisma.company.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        include: { company: true },
        orderBy: { name: 'asc' },
      }),
      prisma.productCapacity.findMany({
        where: { isActive: true },
        orderBy: { capacityIu: 'asc' },
      }),
      prisma.distributionPurposeMaster.findMany({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.systemSetting.findMany(),
    ]);

    const settingsMap = Object.fromEntries(systemSettings.map((s) => [s.key, s.value]));

    const factorTypes = settingsMap['FACTOR_TYPES']
      ? JSON.parse(settingsMap['FACTOR_TYPES'])
      : ['Factor VIII', 'Factor IX', 'Factor VII', 'Factor II', 'Factor XI', 'Factor X', 'Other'];

    const bloodGroups = settingsMap['BLOOD_GROUPS']
      ? JSON.parse(settingsMap['BLOOD_GROUPS'])
      : ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return NextResponse.json({
      success: true,
      data: {
        offices,
        companies,
        products,
        capacities,
        purposes,
        settings: settingsMap,
        factorTypes,
        bloodGroups,
        nepalAdministrative: NEPAL_ADMINISTRATIVE_DATA,
      },
    });
  } catch (error: any) {
    console.error('Master data fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'मास्टर डाटा प्राप्त गर्न सकिएन।', error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
