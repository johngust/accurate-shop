import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '@/lib/s3';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = (formData as any).get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем уникальное имя файла
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;

    // ПРОВЕРЯЕМ: Если настроен Cloudflare R2, грузим туда
    if (process.env.R2_ENDPOINT && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
      console.log('☁️ Загрузка в Cloudflare R2...');
      
      const bucketName = process.env.R2_BUCKET_NAME || 'accurate-media';
      
      await r2Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        })
      );

      const publicUrl = process.env.R2_PUBLIC_URL || `https://pub-your-id.r2.dev`;
      
      return NextResponse.json({ 
        url: `${publicUrl}/${fileName}`,
        success: true 
      });
    }

    // ЛОКАЛЬНАЯ ЗАГРУЗКА (Fallback)
    console.log('💻 Локальная загрузка...');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ 
      url: `/uploads/${fileName}`,
      success: true 
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Ошибка при загрузке файла', details: error.message }, { status: 500 });
  }
}
