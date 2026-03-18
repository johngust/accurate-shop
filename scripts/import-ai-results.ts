import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('Полная очистка каталога...');
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});

    const rawData = fs.readFileSync('scripts/ai_trial_results.json', 'utf8');
    const items = JSON.parse(rawData);

    for (const item of items) {
        const catName = item.ai_category || "Сантехника";
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
                description: `Качество подтверждено ИИ V5 (Разрешение и форма).`,
                brandId: brand.id,
                categoryId: category.id,
                attributes: '{}',
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
        console.log(`[OK] ${item.sku} загружен.`);
    }
}

main().finally(() => prisma.$disconnect());
