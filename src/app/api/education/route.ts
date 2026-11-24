import { NextRequest, NextResponse } from 'next/server';
import { getEducationList, createEducation } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const list = await getEducationList();
    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลประวัติการศึกษาได้' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์เพิ่มข้อมูล (เฉพาะเจ้าของเท่านั้น)' }, { status: 403 });
    }

    const body = await req.json();
    if (!body.degree || !body.institution || !body.fieldOfStudy) {
      return NextResponse.json({ error: 'กรุณากรอกข้อมูลระดับการศึกษา สถาบัน และสาขาวิชา' }, { status: 400 });
    }

    const item = await createEducation(body);
    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error('Error creating education:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลการศึกษา' }, { status: 500 });
  }
}
