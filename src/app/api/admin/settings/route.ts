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

    const settingsRecords = await prisma.systemSetting.findMany();
    const settingsMap = Object.fromEntries(settingsRecords.map((s) => [s.key, s.value]));

    // Defaults
    const factorTypes = settingsMap['FACTOR_TYPES']
      ? JSON.parse(settingsMap['FACTOR_TYPES'])
      : ['Factor VIII', 'Factor IX', 'Factor VII', 'Factor II', 'Factor XI', 'Factor X', 'Von Willebrand Factor', 'Other'];

    const bloodGroups = settingsMap['BLOOD_GROUPS']
      ? JSON.parse(settingsMap['BLOOD_GROUPS'])
      : ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return NextResponse.json({
      success: true,
      data: {
        settings: settingsMap,
        factorTypes,
        bloodGroups,
        lowStockThreshold: settingsMap['LOW_STOCK_THRESHOLD'] || '10',
        expiryAlertDays: settingsMap['EXPIRY_ALERT_DAYS'] || '90',
        organizationName: settingsMap['ORGANIZATION_NAME'] || 'नेपाल हेमोफिलिया सोसाइटी',
        reportSubtitle: settingsMap['REPORT_SUBTITLE'] || 'केन्द्रीय कार्यालय तथा स्याटेलाइट केन्द्रहरू',
        signOffRole: settingsMap['SIGN_OFF_ROLE'] || 'केन्द्रीय अधिकृत / आधिकारिक प्रतिनिधि',
      },
    });
  } catch (error: any) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ success: false, message: 'सेटिङहरू प्राप्त गर्न सकिएन।' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, message: 'केवल सुपर एडमिनलाई मात्र अधिकार छ।' }, { status: 403 });
    }

    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, message: 'सेटिङ Key आवश्यक छ।' }, { status: 400 });
    }

    const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

    const saved = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: strValue },
      create: { key, value: strValue },
    });

    await createAuditLog({
      user,
      action: 'SETTING_UPDATED',
      entityType: 'SystemSetting',
      entityId: key,
      details: { key, value: strValue },
      reason: `प्रणाली सेटिङ अद्यावधिक: ${key}`,
    });

    return NextResponse.json({
      success: true,
      message: 'सेटिङ सफलतापूर्वक सुरक्षित गरियो।',
      data: saved,
    });
  } catch (error: any) {
    console.error('Save setting error:', error);
    return NextResponse.json({ success: false, message: 'सेटिङ सुरक्षित गर्न सकिएन।' }, { status: 500 });
  }
}
