import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, getUserFromRequest } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (user) {
      await createAuditLog({
        user,
        action: 'USER_LOGOUT',
        entityType: 'User',
        entityId: user.id,
        details: { username: user.username },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'सफलतापूर्वक लगआउट भयो।',
    });

    response.cookies.delete(COOKIE_NAME);
    return response;
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
