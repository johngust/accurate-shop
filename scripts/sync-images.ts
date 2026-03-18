import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const IMG_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

async function main() {
    console.log('--- СИНХРОНИЗАЦИЯ КАРТИНОК С БАЗОЙ ДАННЫХ ---');
    
    const products = await prisma.product.findMany({
        include: { variants: true }
    });

    console.log(`Проверка ${products.length} товаров...`);

    const files = fs.readdirSync(IMG_DIR);
    let updated = 0;

    for (const product of products) {
        const sku = product.variants[0]?.sku;
        if (!sku) continue;

        // Ищем любой файл в папке, который содержит артикул
        const realFile = files.find(f => f.includes(sku) && (f.startsWith('AI_BATCH_') || f.startsWith('AI_RESCUE_') || f.startsWith('AI_V9_')));

        if (realFile) {
            const newUrl = `/uploads/products/${realFile}`;
            
            await prisma.media.deleteMany({ where: { productId: product.id } });
            await prisma.media.create({
                data: {
                    productId: product.id,
                    url: newUrl,
                    type: 'IMAGE',
                    isPrimary: true
                }
            });
            updated++;
            console.log(`[OK] ${sku} -> ${realFile}`);
        } else {
            console.log(`[?] Файл для ${sku} не найден на диске.`);
        }
    }

    console.log(`--- ГОТОВО: Обновлено ${updated} путей ---`);
}

main().finally(() => prisma.$disconnect());
