import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { centralStockEntrySchema } from '@/lib/validation';
import { recordCentralStockEntry } from '@/lib/stockService';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'केन्द्रीय स्टक प्रविष्टि गर्ने अधिकार केवल Super Admin लाई मात्र छ।' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = centralStockEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || 'अमान्य स्टक प्रविष्टि विवरण' },
        { status: 400 }
      );
    }

    const entry = await recordCentralStockEntry(parsed.data, user);

    return NextResponse.json({
      success: true,
      message: `केन्द्रीय स्टक सफलतापुर्वक थपियो: ${entry.vialCount} भाइल (${entry.totalIu} IU), ब्याच: ${entry.batchNumber}`,
      data: entry,
    });
  } catch (error: any) {
    console.error('Central stock entry error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'स्टक प्रविष्टि गर्दा समस्या आयो।' },
      { status: 400 }
    );
  }
}
