import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ОЧИСТКА КЭША И ОБНОВЛЕНИЕ ПУТЕЙ ---');

    // 1. Физическое удаление кэша Next.js
    const cachePath = path.join(process.cwd(), '.next', 'cache', 'images');
    if (fs.existsSync(cachePath)) {
        fs.rmSync(cachePath, { recursive: true, force: true });
        console.log('Кэш изображений .next удален.');
    }

    // 2. Обновление путей в базе (добавляем ?v=timestamp)
    const v = Date.now();
    const media = await prisma.media.findMany({
        where: {
            OR: [
                { url: { contains: 'C0510' } },
                { url: { contains: 'C1010' } },
                { url: { contains: 'C6155' } },
                { url: { contains: 'C6255' } },
                { url: { contains: 'WS0110' } },
                { url: { contains: 'D283CP' } },
                { url: { contains: 'F61111' } },
                { url: { contains: 'F6125183' } }
            ]
        }
    });

    for (const item of media) {
        // Убираем старую версию если была и ставим новую
        const cleanUrl = item.url.split('?')[0];
        await prisma.media.update({
            where: { id: item.id },
            data: { url: `${cleanUrl}?v=${v}` }
        });
    }

    console.log(`Обновлено ${media.length} путей. Теперь браузер обязан скачать новые файлы.`);
}

main().finally(() => prisma.$disconnect());
