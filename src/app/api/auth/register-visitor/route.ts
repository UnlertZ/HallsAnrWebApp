import { NextRequest, NextResponse } from 'next/server';
import { recordVisitorLog } from '@/lib/db';
import { signSessionToken, COOKIE_NAME } from '@/lib/auth';
import { SessionUser } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorName, companyName, email, phone, purpose } = body;

    if (!visitorName?.trim() || !companyName?.trim()) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อผู้เยี่ยมชมและชื่อบริษัท/หน่วยงาน' },
        { status: 400 }
      );
    }

    // Capture IP address and user-agent
    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Record visitor in SQL Database
    const visitorRecord = await recordVisitorLog({
      visitorName: visitorName.trim(),
      companyName: companyName.trim(),
      email: email?.trim() || undefined,
      phone: phone?.trim() || undefined,
      purpose: purpose?.trim() || undefined,
      ipAddress,
      userAgent,
    });

    const session: SessionUser = {
      role: 'visitor',
      visitorId: visitorRecord.id,
      visitorName: visitorRecord.visitorName,
      companyName: visitorRecord.companyName,
      loginAt: visitorRecord.visitedAt,
    };

    const token = signSessionToken(session);

    const response = NextResponse.json({
      success: true,
      message: 'ยินดีต้อนรับเข้าสู่เว็บไซต์ HallsAnr',
      session,
      visitorRecord,
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
    console.error('Visitor registration error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียนเข้าชม' }, { status: 500 });
  }
}
