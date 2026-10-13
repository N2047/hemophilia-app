import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { stockTransferSchema } from '@/lib/validation';
import { executeStockTransfer } from '@/lib/stockService';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'अनधिकृत पहुँच' }, { status: 401 });
    }

    if (user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, message: 'स्याटेलाइटमा औषधि पठाउने अधिकार केवल Super Admin लाई मात्र छ।' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = stockTransferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || 'अमान्य ट्रान्सफर विवरण' },
        { status: 400 }
      );
    }

    const transfer = await executeStockTransfer(parsed.data, user);

    return NextResponse.json({
      success: true,
      message: `औषधि सफलतापूर्वक स्याटेलाइटमा पठाइयो! ट्रान्सफर नम्बर: ${transfer.transferNumber}, कुल भाइल: ${transfer.totalVials} (${transfer.totalIu} IU)`,
      data: transfer,
    });
  } catch (error: any) {
    console.error('Stock transfer error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'स्टक ट्रान्सफर गर्दा समस्या आयो।' },
      { status: 400 }
    );
  }
}
