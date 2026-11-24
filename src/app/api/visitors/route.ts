import { NextRequest, NextResponse } from 'next/server';
import { getVisitorLogs } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    // STRICT SECURITY: Only Owner can see visitor logs!
    if (!session || session.role !== 'owner') {
      return NextResponse.json(
        { error: 'ไม่อนุญาตให้เข้าถึง: ประวัติผู้เยี่ยมชมสามารถดูได้เฉพาะเจ้าของเว็บไซต์ (ฮอลล์) เท่านั้น' },
        { status: 403 }
      );
    }

    const logs = await getVisitorLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching visitor logs:', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลประวัติผู้เข้าชมได้' }, { status: 500 });
  }
}
