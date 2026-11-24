import { NextRequest, NextResponse } from 'next/server';
import { uploadMediaFile } from '@/lib/azure-blob';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'owner') {
      return NextResponse.json(
        { error: 'คุณไม่มีสิทธิ์อัปโหลดไฟล์ (เฉพาะเจ้าของเว็บไซต์เท่านั้น)' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ขนาดไฟล์เกิน 10MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลง' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMediaFile(buffer, file.name, file.type || 'application/octet-stream');

    return NextResponse.json({
      success: true,
      url: result.url,
      storageType: result.storageType,
      fileName: file.name,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' }, { status: 500 });
  }
}
