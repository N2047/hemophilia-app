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

    const [companies, products, capacities] = await Promise.all([
      prisma.company.findMany({ orderBy: { name: 'asc' } }),
      prisma.product.findMany({ include: { company: true }, orderBy: { name: 'asc' } }),
      prisma.productCapacity.findMany({ orderBy: { capacityIu: 'asc' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { companies, products, capacities },
    });
  } catch (error: any) {
    console.error('Fetch catalog error:', error);
    return NextResponse.json({ success: false, message: 'क्याटलग विवरण प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केवल सुपर एडमिनलाई मात्र अधिकार छ।' }, { status: 403 });
    }

    const body = await req.json();
    const { action, name, companyId, factorType, capacityIu, label } = body;

    // Action 1: Create Company
    if (action === 'CREATE_COMPANY') {
      if (!name || !name.trim()) {
        return NextResponse.json({ success: false, message: 'कम्पनीको नाम अनिवार्य छ।' }, { status: 400 });
      }

      const existing = await prisma.company.findUnique({ where: { name: name.trim() } });
      if (existing) {
        return NextResponse.json({ success: false, message: 'यो कम्पनी पहिले नै दर्ता छ।' }, { status: 400 });
      }

      const created = await prisma.company.create({
        data: { name: name.trim(), isActive: true },
      });

      await createAuditLog({
        user,
        action: 'COMPANY_CREATED',
        entityType: 'Company',
        entityId: created.id,
        details: { created },
        reason: 'नयाँ उत्पादक कम्पनी थपियो',
      });

      return NextResponse.json({ success: true, message: 'कम्पनी सफलतापूर्वक थपियो।', data: created });
    }

    // Action 2: Create Product
    if (action === 'CREATE_PRODUCT') {
      if (!name || !name.trim() || !companyId || !factorType) {
        return NextResponse.json({ success: false, message: 'उत्पादन नाम, कम्पनी र फ्याक्टर प्रकार अनिवार्य छ।' }, { status: 400 });
      }

      const trimmedName = name.trim();
      const trimmedFactorType = factorType.trim();

      const existingProduct = await prisma.product.findUnique({
        where: {
          companyId_name_factorType: {
            companyId,
            name: trimmedName,
            factorType: trimmedFactorType,
          },
        },
        include: { company: true },
      });

      if (existingProduct) {
        if (!existingProduct.isActive) {
          const reactivated = await prisma.product.update({
            where: { id: existingProduct.id },
            data: { isActive: true },
            include: { company: true },
          });
          return NextResponse.json({
            success: true,
            message: 'यो उत्पादन पुनः सक्रिय गरियो।',
            data: reactivated,
          });
        }
        return NextResponse.json({
          success: true,
          message: 'यो उत्पादन पहिले नै उपलब्ध छ।',
          data: existingProduct,
        });
      }

      const created = await prisma.product.create({
        data: {
          name: trimmedName,
          companyId,
          factorType: trimmedFactorType,
          isActive: true,
        },
        include: { company: true },
      });

      // Automatically sync factor type into system settings
      try {
        const factorSetting = await prisma.systemSetting.findUnique({ where: { key: 'FACTOR_TYPES' } });
        let list = [
          'Factor VIII',
          'Factor IX',
          'Factor VII',
          'FEIBA',
          'Factor XIII',
          'Factor II',
          'Factor X',
          'Factor XI',
          'Von Willebrand Factor (VWF)',
          'Hemlibra (Emicizumab)',
          'Other',
        ];
        if (factorSetting?.value) {
          try {
            const parsed = JSON.parse(factorSetting.value);
            if (Array.isArray(parsed)) list = parsed;
          } catch (e) {}
        }
        if (!list.includes(trimmedFactorType)) {
          list.push(trimmedFactorType);
          await prisma.systemSetting.upsert({
            where: { key: 'FACTOR_TYPES' },
            create: { key: 'FACTOR_TYPES', value: JSON.stringify(list) },
            update: { value: JSON.stringify(list) },
          });
        }
      } catch (e) {}

      await createAuditLog({
        user,
        action: 'PRODUCT_CREATED',
        entityType: 'Product',
        entityId: created.id,
        details: { created },
        reason: 'नयाँ औषधि ब्रान्ड/उत्पादन थपियो',
      });

      return NextResponse.json({ success: true, message: 'उत्पादन सफलतापूर्वक थपियो।', data: created });
    }

    // Action 3: Create Product Capacity
    if (action === 'CREATE_CAPACITY') {
      const capInt = parseInt(capacityIu);
      if (!capInt || capInt <= 0) {
        return NextResponse.json({ success: false, message: 'मान्य भाइल क्षमता (IU) प्रविष्ट गर्नुहोस्।' }, { status: 400 });
      }

      const existing = await prisma.productCapacity.findUnique({ where: { capacityIu: capInt } });
      if (existing) {
        return NextResponse.json({ success: false, message: 'यो क्षमता पहिले नै उपलब्ध छ।' }, { status: 400 });
      }

      const created = await prisma.productCapacity.create({
        data: {
          capacityIu: capInt,
          label: label || `${capInt} IU`,
          isActive: true,
        },
      });

      await createAuditLog({
        user,
        action: 'CAPACITY_CREATED',
        entityType: 'ProductCapacity',
        entityId: created.id,
        details: { created },
        reason: 'नयाँ भाइल क्षमता (IU) थपियो',
      });

      return NextResponse.json({ success: true, message: 'भाइल क्षमता सफलतापूर्वक थपियो।', data: created });
    }

    return NextResponse.json({ success: false, message: 'अमान्य कार्य।' }, { status: 400 });
  } catch (error: any) {
    console.error('Catalog POST error:', error);
    return NextResponse.json({ success: false, message: 'थप्न सकिएन।' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केवल सुपर एडमिनलाई मात्र अधिकार छ।' }, { status: 403 });
    }

    const body = await req.json();
    const { action, id, name, isActive, companyId, factorType, label } = body;

    if (action === 'UPDATE_COMPANY') {
      const updated = await prisma.company.update({
        where: { id },
        data: {
          name: name ? name.trim() : undefined,
          isActive: typeof isActive === 'boolean' ? isActive : undefined,
        },
      });
      return NextResponse.json({ success: true, message: 'कम्पनी अद्यावधिक गरियो।', data: updated });
    }

    if (action === 'UPDATE_PRODUCT') {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          name: name ? name.trim() : undefined,
          companyId: companyId || undefined,
          factorType: factorType || undefined,
          isActive: typeof isActive === 'boolean' ? isActive : undefined,
        },
        include: { company: true },
      });
      return NextResponse.json({ success: true, message: 'उत्पादन अद्यावधिक गरियो।', data: updated });
    }

    if (action === 'UPDATE_CAPACITY') {
      const updated = await prisma.productCapacity.update({
        where: { id },
        data: {
          label: label || undefined,
          isActive: typeof isActive === 'boolean' ? isActive : undefined,
        },
      });
      return NextResponse.json({ success: true, message: 'क्षमता अद्यावधिक गरियो।', data: updated });
    }

    return NextResponse.json({ success: false, message: 'अमान्य कार्य।' }, { status: 400 });
  } catch (error: any) {
    console.error('Catalog PUT error:', error);
    return NextResponse.json({ success: false, message: 'अद्यावधिक गर्न सकिएन।' }, { status: 500 });
  }
}
