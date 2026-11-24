import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerCredentials, signSessionToken, COOKIE_NAME } from '@/lib/auth';
import { SessionUser } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' }, { status: 400 });
    }

    const isValid = await verifyOwnerCredentials(username, password);
    if (!isValid) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const session: SessionUser = {
      role: 'owner',
      username: username.trim(),
      loginAt: new Date().toISOString(),
    };

    const token = signSessionToken(session);

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบในฐานะเจ้าของเรียบร้อยแล้ว',
      session,
    });

    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Owner login error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
