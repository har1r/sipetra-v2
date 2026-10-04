import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      const singleFile = formData.get('file') as File | null;
      if (singleFile) {
        files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tidak ada berkas yang diunggah.' },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    for (const file of files) {
      if (typeof file === 'string' || !file.name) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${safeName}`;
      const filePath = path.join(uploadDir, uniqueFileName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${uniqueFileName}`);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0] || null,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mengunggah berkas.' },
      { status: 500 }
    );
  }
}
