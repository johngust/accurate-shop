import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ЗАГРУЗКА ГРУППИРОВАННЫХ ТОВАРОВ V11 ---');
    
    // Очистка базы для чистого теста
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});

    const rawData = fs.readFileSync('scripts/ai_grouped_results.json', 'utf8');
    const groups = JSON.parse(rawData);

    for (const group of groups) {
        // Создаем базовую категорию
        const category = await prisma.category.upsert({
            where: { slug: 'grouped-products' },
            update: {},
            create: { name: 'Групповые товары', slug: 'grouped-products' }
        });

        const brand = await prisma.brand.upsert({
            where: { slug: group.brand.toLowerCase() },
            update: {},
            create: { name: group.brand, slug: group.brand.toLowerCase() }
        });

        // Создаем ОДИН товар для всей группы
        const product = await prisma.product.create({
            data: {
                name: group.name,
                slug: `${uuidv4().slice(0, 8)}`,
                description: `Коллекция ${group.name} от ${group.brand}. Доступно в нескольких размерах.`,
                brandId: brand.id,
                categoryId: category.id,
                attributes: '{}',
                media: {
                    create: {
                        url: group.image,
                        type: 'IMAGE',
                        isPrimary: true
                    }
                }
            }
        });

        // Добавляем ВСЕ варианты (размеры) к этому товару
        for (const variant of group.variants) {
            await prisma.productVariant.create({
                data: {
                    productId: product.id,
                    sku: variant.sku,
                    price: variant.price,
                    stock: variant.stock,
                    options: JSON.stringify({ size: variant.size })
                }
            });
        }
        console.log(`[OK] Группа '${group.name}' загружена (${group.variants.length} вар.)`);
    }

    console.log('--- ИМПОРТ V11 ЗАВЕРШЕН ---');
}

main().finally(() => prisma.$disconnect());
