import { NextRequest, NextResponse } from 'next/server';
import { getExperienceList, createExperience } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const list = await getExperienceList();
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching experience:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลประวัติการทำงานได้' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์เพิ่มข้อมูลนี้ (เฉพาะเจ้าของเท่านั้น)' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.jobTitle || !body.companyName || !body.startDate) {
      return NextResponse.json({ error: 'กรุณากรอกตำแหน่งงาน ชื่อบริษัท และวันที่เริ่มงาน' }, { status: 400 });
    }

    const item = await createExperience(body);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating experience:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการทำงาน' }, { status: 500 });
  }
}
