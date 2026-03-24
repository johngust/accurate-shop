import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ГЛОБАЛЬНАЯ ОЧИСТКА БИТЫХ ДАННЫХ ---');
    
    // Находим ID товаров без категорий
    const badProducts = await prisma.product.findMany({
        where: { categoryId: null as any },
        select: { id: true }
    });

    const ids = badProducts.map(p => p.id);
    console.log(`Найдено товаров без категорий: ${ids.length}`);

    if (ids.length > 0) {
        await prisma.$transaction([
            prisma.media.deleteMany({ where: { productId: { in: ids } } }),
            prisma.productVariant.deleteMany({ where: { productId: { in: ids } } }),
            prisma.product.deleteMany({ where: { id: { in: ids } } }),
        ]);
        console.log('Битые товары и их зависимости удалены.');
    } else {
        console.log('Битых товаров не обнаружено.');
    }
}

main().finally(() => prisma.$disconnect());
