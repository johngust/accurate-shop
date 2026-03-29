import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = (formData as any).get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    
    // Создаем уникальное имя файла
    const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // ПРОВЕРЯЕМ: Если есть привязка Cloudflare R2 (через wrangler.toml)
    const bucket = (process.env as any).BUCKET;

    if (bucket) {
      // Использование нативного API R2 (намного легче, чем AWS SDK)
      await bucket.put(fileName, bytes, {
        httpMetadata: {
          contentType: file.type,
        }
      });

      const publicUrl = process.env.R2_PUBLIC_URL || `https://pub-your-id.r2.dev`;
      
      return NextResponse.json({ 
        url: `${publicUrl}/${fileName}`,
        success: true 
      });
    }

    return NextResponse.json({ 
      error: 'R2 Storage (BUCKET binding) не найден. Убедитесь, что биндинг настроен в Cloudflare Pages.',
      success: false
    }, { status: 500 });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Ошибка при загрузке файла', details: error.message }, { status: 500 });
  }
}
