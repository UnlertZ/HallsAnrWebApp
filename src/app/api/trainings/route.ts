import { NextRequest, NextResponse } from 'next/server';
import { getTrainingList, createTraining } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const list = await getTrainingList();
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลการฝึกอบรมได้' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์เพิ่มข้อมูลนี้ (เฉพาะเจ้าของเท่านั้น)' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.title || !body.issuer || !body.issueDate) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อหลักสูตร สถาบันผู้ออก และวันที่ได้รับ' }, { status: 400 });
    }

    const item = await createTraining(body);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating training:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการอบรม' }, { status: 500 });
  }
}
