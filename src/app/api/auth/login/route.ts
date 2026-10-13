import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signSessionToken, COOKIE_NAME } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
import { createAuditLog } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message || 'अमान्य लगइन विवरण' },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
      include: { office: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'प्रयोगकर्ता नाम वा पासवर्ड मिलेन।' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'तपाईंको खाता निष्क्रिय गरिएको छ। कृपया एडमिनसँग सम्पर्क गर्नुहोस्।' },
        { status: 403 }
      );
    }

    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'प्रयोगकर्ता नाम वा पासवर्ड मिलेन।' },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role as 'SUPER_ADMIN' | 'OFFICE_USER',
      officeId: user.officeId,
      officeName: user.office?.nameNepali || null,
    };

    const token = await signSessionToken(sessionUser);

    await createAuditLog({
      user: sessionUser,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      details: { username: user.username, role: user.role, office: user.office?.nameNepali },
    });

    const response = NextResponse.json({
      success: true,
      message: 'सफलतापूर्वक लगइन भयो।',
      user: sessionUser,
    });

    // Set HTTP-only secure cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'लगइन गर्दा प्राविधिक समस्या आयो।' },
      { status: 500 }
    );
  }
}
