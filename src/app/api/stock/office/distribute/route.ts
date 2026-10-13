import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { patientDistributionSchema } from '@/lib/validation';
import { executePatientDistribution } from '@/lib/stockService';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    const body = await req.json();

    // If caller is office user, enforce officeId to their own office
    if (user.role === 'OFFICE_USER') {
      body.officeId = user.officeId;
    }

    const parsed = patientDistributionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || 'अमान्य वितरण विवरण' },
        { status: 400 }
      );
    }

    const distribution = await executePatientDistribution(parsed.data, user);

    return NextResponse.json({
      success: true,
      message: `बिरामीलाई औषधि सफलतापूर्वक वितरण गरियो! रसिद नम्बर: ${distribution.voucherNumber}, कुल भाइल: ${distribution.totalVials} (${distribution.totalIu} IU)`,
      data: distribution,
    });
  } catch (error: any) {
    console.error('Distribution error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'औषधि वितरण गर्दा समस्या आयो।' },
      { status: 400 }
    );
  }
}
