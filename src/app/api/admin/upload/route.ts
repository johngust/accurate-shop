import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем уникальное имя файла
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Путь для сохранения
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Проверяем/создаем папку
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Папка уже существует
    }

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Возвращаем публичный путь
    return NextResponse.json({ 
      url: `/uploads/${fileName}`,
      success: true 
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Ошибка при загрузке файла' }, { status: 500 });
  }
}
