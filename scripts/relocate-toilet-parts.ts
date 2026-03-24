import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- РЕОРГАНИЗАЦИЯ РАЗДЕЛА УНИТАЗЫ ---');

    // 1. Находим раздел 'Унитазы'
    const unitazy = await prisma.category.findFirst({
        where: { name: 'Унитазы' }
    });

    if (!unitazy) {
        console.log('Раздел Унитазы не найден');
        return;
    }

    const compCat = await prisma.category.upsert({
        where: { slug: 'unitazy-komplekt' },
        update: { name: 'Комплектующие' },
        create: { 
            name: 'Комплектующие', 
            slug: 'unitazy-komplekt',
            parentId: unitazy.id
        }
    });

    console.log(`Подкатегория '${compCat.name}' создана в '${unitazy.name}'.`);

    // 2. Ключевые слова для переноса
    const keywords = ['манжет', 'сиденье', 'удлинитель', 'креплен', 'OLO10', 'OLO20'];

    // 3. Поиск и перенос
    let count = 0;
    const products = await prisma.product.findMany();

    for (const p of products) {
        const nameL = p.name.toLowerCase();
        if (keywords.some(k => nameL.includes(k.toLowerCase()))) {
            await prisma.product.update({
                where: { id: p.id },
                data: { categoryId: compCat.id }
            });
            console.log(`[ПЕРЕЕЗД] ${p.name}`);
            count++;
        }
    }

    console.log(`--- ИТОГ: Перенесено ${count} товаров в комплектующие ---`);
}

main().finally(() => prisma.$disconnect());
