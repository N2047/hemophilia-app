import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { patientSchema } from '@/lib/validation';
import { calculateFactorSeverity } from '@/lib/severityCalculator';
import { createAuditLog } from '@/lib/audit';

function generatePatientCode(counter: number): string {
  const year = new Date().getFullYear();
  const serial = counter.toString().padStart(4, '0');
  return `HEP-${year}-${serial}`;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';
    const officeFilter = searchParams.get('officeId') || undefined;
    const severityFilter = searchParams.get('severity') || undefined;
    const factorFilter = searchParams.get('factorType') || undefined;

    const whereClause: any = { isActive: true };

    if (query) {
      whereClause.OR = [
        { fullName: { contains: query } },
        { patientCode: { contains: query } },
        { phone: { contains: query } },
      ];
    }

    if (officeFilter) {
      whereClause.registeredOfficeId = officeFilter;
    }

    if (severityFilter) {
      whereClause.severity = severityFilter;
    }

    if (factorFilter) {
      whereClause.factorType = factorFilter;
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, data: patients });
  } catch (error: any) {
    console.error('Patient search error:', error);
    return NextResponse.json({ success: false, message: 'बिरामी खोज्न सकिएन।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || 'अमान्य बिरामी विवरण' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Duplicate check
    const checkDuplicate = body.confirmDuplicate !== true;
    if (checkDuplicate) {
      const existingPatientWithPhone = await prisma.patient.findFirst({
        where: {
          phone: data.phone,
          isActive: true,
        },
      });

      if (existingPatientWithPhone) {
        return NextResponse.json(
          {
            success: false,
            duplicateWarning: true,
            message: `चेतावनी: फोन नम्बर ${data.phone} बाट बिरामी '${existingPatientWithPhone.fullName}' (ID: ${existingPatientWithPhone.patientCode}) पहिले नै दर्ता छ! के यो सोही बिरामी हो वा फरक व्यक्ति? पुष्टि गर्न पुन: पठाउनुहोस्।`,
            existingPatient: existingPatientWithPhone,
          },
          { status: 409 }
        );
      }
    }

    // Auto-calculate age if DOB is provided
    let calculatedAge = data.age;
    let isDobEstimated = data.isDobEstimated;
    let dobDate: Date | null = null;

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
    } else {
      isDobEstimated = true;
    }

    // Severity calculation
    const calc = calculateFactorSeverity(data.factorType, data.factorLevelPercent);
    const finalSeverity = data.severityOverridden ? data.severity : calc.severity;

    // Generate unique Patient Code
    const totalCount = await prisma.patient.count();
    const patientCode = generatePatientCode(totalCount + 1);

    const newPatient = await prisma.patient.create({
      data: {
        patientCode,
        fullName: data.fullName.trim(),
        dateOfBirth: dobDate,
        isDobEstimated,
        age: calculatedAge,
        gender: data.gender || 'पुरुष',
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
        isActive: true,
      },
    });

    await createAuditLog({
      user,
      action: 'PATIENT_REGISTERED',
      entityType: 'Patient',
      entityId: newPatient.id,
      details: {
        patientCode: newPatient.patientCode,
        fullName: newPatient.fullName,
        factorType: newPatient.factorType,
        severity: newPatient.severity,
        officeId: data.registeredOfficeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `बिरामी ${newPatient.fullName} सफलतापूर्वक दर्ता हुनुभयो। दर्ता ID: ${newPatient.patientCode}`,
      data: newPatient,
    });
  } catch (error: any) {
    console.error('Patient registration error:', error);
    return NextResponse.json(
      { success: false, message: 'बिरामी दर्ता गर्दा समस्या आयो।' },
      { status: 500 }
    );
  }
}
