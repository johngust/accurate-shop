import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ФИНАЛЬНАЯ ЗАГРУЗКА 100 ТОВАРОВ ---');
    
    // 1. Очистка базы
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    console.log('База очищена.');

    // 2. Объединяем результаты
    const batch1 = JSON.parse(fs.readFileSync('scripts/ai_batch_100_results.json', 'utf8'));
    const batch2 = JSON.parse(fs.readFileSync('scripts/ai_rescue_results.json', 'utf8'));
    const allItems = [...batch1, ...batch2];

    const seenSkus = new Set();
    let imported = 0;

    for (const item of allItems) {
        if (seenSkus.has(item.sku)) continue;
        seenSkus.add(item.sku);

        const specs = item.ai_attributes || {};
        const catName = specs["Категория"] || "Сантехника";
        
        const category = await prisma.category.upsert({
            where: { slug: catName.toLowerCase().replace(/\s+/g, '-') },
            update: {},
            create: { 
                name: catName, 
                slug: catName.toLowerCase().replace(/\s+/g, '-') 
            }
        });

        const brand = await prisma.brand.upsert({
            where: { slug: item.brand.toLowerCase() },
            update: {},
            create: { name: item.brand, slug: item.brand.toLowerCase() }
        });

        await prisma.product.create({
            data: {
                name: item.name,
                slug: `${item.sku.toLowerCase()}-${uuidv4().slice(0, 4)}`,
                description: `${item.name}. Статус: ${item.ai_status || 'OK'}. 4K Quality.`,
                brandId: brand.id,
                categoryId: category.id,
                attributes: JSON.stringify(specs),
                variants: {
                    create: {
                        sku: item.sku,
                        price: item.price,
                        stock: item.stock,
                        options: '{}'
                    }
                },
                media: {
                    create: {
                        url: item.ai_image,
                        type: 'IMAGE',
                        isPrimary: true
                    }
                }
            }
        });
        imported++;
    }

    console.log(`--- УСПЕХ: ${imported} ТОВАРОВ НА САЙТЕ ---`);
}

main().finally(() => prisma.$disconnect());
