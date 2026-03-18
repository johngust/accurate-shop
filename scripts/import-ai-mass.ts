import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ФИНАЛЬНАЯ ЗАГРУЗКА КАТАЛОГА (ГИБКИЙ ПОИСК КАТЕГОРИЙ) ---');
    
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});

    const rawData = fs.readFileSync('scripts/ai_mass_test_results.json', 'utf8');
    const items = JSON.parse(rawData);

    for (const item of items) {
        const specs = item.ai_attributes || {};
        const catName = item.ai_category || "Сантехника";
        
        // ГИБКИЙ ПОИСК КАТЕГОРИИ
        const categories = await prisma.category.findMany();
        const category = categories.find(c => 
            c.name.toLowerCase().includes(catName.toLowerCase().split(' ')[0]) || 
            catName.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
        );

        if (!category) {
            console.log(`[!] Категория '${catName}' не найдена. Пропуск.`);
            continue;
        }

        const brand = await prisma.brand.upsert({
            where: { slug: item.brand.toLowerCase() },
            update: {},
            create: { name: item.brand, slug: item.brand.toLowerCase() }
        });

        await prisma.product.create({
            data: {
                name: item.name,
                slug: `${item.sku.toLowerCase()}-${uuidv4().slice(0, 4)}`,
                description: `${item.name}. Качество 4K, интеллектуальная навигация V12.`,
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
        console.log(`[OK] ${item.sku} -> ${category.name}`);
    }

    console.log('--- ИМПОРТ ЗАВЕРШЕН УСПЕШНО ---');
}

main().finally(() => prisma.$disconnect());
