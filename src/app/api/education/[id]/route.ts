import { NextRequest, NextResponse } from 'next/server';
import { updateEducation, deleteEducation } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const updated = await updateEducation(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'ไม่พบรายการที่ต้องการแก้ไข' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error updating education:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลการศึกษา' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'owner') {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์ลบข้อมูลนี้' }, { status: 403 });
    }

    const { id } = await params;
    const success = await deleteEducation(id);
    if (!success) {
      return NextResponse.json({ error: 'ไม่พบรายการที่ต้องการลบ' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'ลบข้อมูลเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting education:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูลการศึกษา' }, { status: 500 });
  }
}
