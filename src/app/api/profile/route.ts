import { NextRequest, NextResponse } from 'next/server';
import { getProfile, updateProfile } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const profile = await getProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้ (เฉพาะเจ้าของเท่านั้น)' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await updateProfile(body);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกโปรไฟล์' }, { status: 500 });
  }
}
