import { NextRequest, NextResponse } from 'next/server';
import { deleteVisitorLog } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

interface Context {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'owner') {
      return NextResponse.json(
        { error: 'ไม่อนุญาต: คุณไม่มีสิทธิ์ลบข้อมูลบันทึกผู้เยี่ยมชม' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const success = await deleteVisitorLog(id);
    if (!success) {
      return NextResponse.json({ error: 'ไม่พบบันทึกที่ต้องการลบ' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'ลบบันทึกผู้เข้าชมเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting visitor log:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบบันทึก' }, { status: 500 });
  }
}
