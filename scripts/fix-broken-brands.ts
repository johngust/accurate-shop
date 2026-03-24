import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ОПЕРАЦИЯ: ЛЕЧЕНИЕ БИТЫХ СВЯЗЕЙ БРЕНДОВ ---');
    
    // 1. Находим товары, у которых бренд не найден
    const products = await prisma.product.findMany({
        include: { brand: true }
    });

    const brokenProducts = products.filter(p => !p.brand);
    console.log(`Найдено товаров с битыми брендами: ${brokenProducts.length}`);

    if (brokenProducts.length > 0) {
        // Создаем дефолтный бренд
        const defaultBrand = await prisma.brand.upsert({
            where: { slug: 'unknown' },
            update: {},
            create: { name: 'Unknown Brand', slug: 'unknown' }
        });

        for (const p of brokenProducts) {
            await prisma.product.update({
                where: { id: p.id },
                data: { brandId: defaultBrand.id }
            });
        }
        console.log(`Все битые товары привязаны к бренду: ${defaultBrand.name}`);
    }

    console.log('--- БАЗА ДАННЫХ ПРИВЕДЕНА В ПОРЯДОК ---');
}

main().finally(() => prisma.$disconnect());
