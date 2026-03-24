import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- СТАРТ ГЕНЕРАЛЬНОЙ УБОРКИ КАТАЛОГА ---');

    // 1. Исправление брендов
    console.log('Проверка брендов...');
    const defaultBrand = await prisma.brand.upsert({
        where: { slug: 'premium-brand' },
        update: {},
        create: { name: 'Premium Brand', slug: 'premium-brand' }
    });

    await prisma.$executeRaw`
        UPDATE Product 
        SET brandId = ${defaultBrand.id} 
        WHERE brandId NOT IN (SELECT id FROM Brand)
    `;

    // 2. Исправление категорий (на подкатегории)
    console.log('Проверка категорий...');
    const defaultCat = await prisma.category.findFirst({
        where: { parentId: { not: null } }
    });

    if (defaultCat) {
        await prisma.$executeRaw`
            UPDATE Product 
            SET categoryId = ${defaultCat.id} 
            WHERE categoryId IS NULL OR categoryId NOT IN (SELECT id FROM Category)
        `;
    }

    // 3. Исправление JSON полей (options в вариантах и attributes в товарах)
    console.log('Валидация JSON полей...');
    
    // Исправляем варианты
    const variants = await prisma.productVariant.findMany();
    for (const v of variants) {
        if (!v.options || v.options === 'null' || v.options === '') {
            await prisma.productVariant.update({
                where: { id: v.id },
                data: { options: '{}' }
            });
        }
    }

    // Исправляем товары
    const products = await prisma.product.findMany();
    for (const p of products) {
        if (!p.attributes || p.attributes === 'null' || p.attributes === '') {
            await prisma.product.update({
                where: { id: p.id },
                data: { attributes: '{}' }
            });
        }
    }

    // 4. Удаление товаров без медиа (чтобы не было пустых карточек)
    console.log('Удаление пустых карточек...');
    const itemsWithNoMedia = await prisma.product.findMany({
        where: { media: { none: {} } }
    });
    
    for (const p of itemsWithNoMedia) {
        await prisma.productVariant.deleteMany({ where: { productId: p.id } });
        await prisma.product.deleteMany({ where: { id: p.id } });
    }

    console.log(`Уборка завершена! Удалено ${itemsWithNoMedia.length} пустых товаров.`);
}

main().finally(() => prisma.$disconnect());
