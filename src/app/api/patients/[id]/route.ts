import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { patientSchema } from '@/lib/validation';
import { calculateFactorSeverity } from '@/lib/severityCalculator';
import { createAuditLog } from '@/lib/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const { id } = params;

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id }, { patientCode: id }],
        isActive: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ success: false, message: 'बिरामी फेला परेन।' }, { status: 404 });
    }

    // Retrieve all distributions for this patient
    const distributions = await prisma.patientDistribution.findMany({
      where: { patientId: patient.id },
      orderBy: { distributionDate: 'desc' },
      include: {
        office: true,
        dispensedBy: true,
        items: true,
      },
    });

    // Calculate yearly and lifetime totals
    let totalLifetimeVials = 0;
    let totalLifetimeIu = 0;
    const yearlyBreakdown: Record<number, { count: number; vials: number; iu: number }> = {};

    const formattedDistributions = distributions.map((d) => {
      totalLifetimeVials += d.totalVials;
      totalLifetimeIu += d.totalIu;

      const year = new Date(d.distributionDate).getFullYear();
      if (!yearlyBreakdown[year]) {
        yearlyBreakdown[year] = { count: 0, vials: 0, iu: 0 };
      }
      yearlyBreakdown[year].count += 1;
      yearlyBreakdown[year].vials += d.totalVials;
      yearlyBreakdown[year].iu += d.totalIu;

      let parsedPurposes: string[] = [];
      try {
        parsedPurposes = JSON.parse(d.purposes);
      } catch (e) {
        parsedPurposes = [d.purposes];
      }

      // Check if office user is viewing distribution from another office
      const isOtherOffice = user.role === 'OFFICE_USER' && d.officeId !== user.officeId;

      return {
        id: d.id,
        voucherNumber: d.voucherNumber,
        distributionDate: d.distributionDate,
        officeId: d.officeId,
        officeName: d.office.nameNepali,
        dispensedByName: isOtherOffice ? 'अन्य कार्यालय कर्मचारी' : d.dispensedBy.name,
        prescribingClinician: d.prescribingClinician,
        purposes: parsedPurposes,
        purposeDetails: d.purposeDetails,
        totalVials: d.totalVials,
        totalIu: d.totalIu,
        remarks: d.remarks,
        items: d.items,
        isFromDifferentOffice: isOtherOffice,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        patient,
        summary: {
          totalDistributionsCount: distributions.length,
          totalLifetimeVials,
          totalLifetimeIu,
          yearlyBreakdown,
        },
        distributionHistory: formattedDistributions,
      },
    });
  } catch (error: any) {
    console.error('Patient detail error:', error);
    return NextResponse.json({ success: false, message: 'बिरामीको प्रोफाइल प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const existingPatient = await prisma.patient.findUnique({
      where: { id },
    });
    if (!existingPatient) {
      return NextResponse.json({ success: false, message: 'बिरामी फेला परेन।' }, { status: 404 });
    }

    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || 'अमान्य बिरामी विवरण' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let dobDate: Date | null = null;
    let calculatedAge = data.age;
    let isDobEstimated = data.isDobEstimated;

    if (data.dateOfBirth) {
      dobDate = new Date(data.dateOfBirth);
      const today = new Date();
      let ageYears = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
        ageYears--;
      }
      calculatedAge = ageYears >= 0 ? ageYears : data.age;
      isDobEstimated = false;
    }

    const calc = calculateFactorSeverity(data.factorType, data.factorLevelPercent);
    const finalSeverity = data.severityOverridden ? data.severity : calc.severity;

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        fullName: data.fullName.trim(),
        dateOfBirth: dobDate,
        isDobEstimated,
        age: calculatedAge,
        gender: data.gender,
        phone: data.phone.trim(),
        bloodGroup: data.bloodGroup,
        province: data.province,
        district: data.district,
        localLevel: data.localLevel,
        wardNo: data.wardNo,
        toleAddress: data.toleAddress || null,
        tempAddress: data.tempAddress || null,
        factorType: data.factorType,
        otherFactorDetails: data.otherFactorDetails || null,
        factorLevelPercent: data.factorLevelPercent ?? null,
        severity: finalSeverity,
        severityOverridden: data.severityOverridden,
        overrideReason: data.overrideReason || null,
        registeredOfficeId: data.registeredOfficeId,
      },
    });

    await createAuditLog({
      user,
      action: 'PATIENT_UPDATED',
      entityType: 'Patient',
      entityId: updated.id,
      details: {
        patientCode: updated.patientCode,
        fullName: updated.fullName,
        changes: data,
      },
      reason: body.editReason || 'बिरामी विवरण अद्यावधिक',
    });

    return NextResponse.json({
      success: true,
      message: 'बिरामीको विवरण सफलतापूर्वक अद्यावधिक गरियो।',
      data: updated,
    });
  } catch (error: any) {
    console.error('Patient update error:', error);
    return NextResponse.json({ success: false, message: 'अद्यावधिक गर्दा समस्या आयो।' }, { status: 500 });
  }
}
