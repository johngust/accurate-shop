import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- АВТО-КАТЕГОРИЗАЦИЯ ТОВАРОВ ---');

    const products = await prisma.product.findMany();
    const categories = await prisma.category.findMany({
        where: { NOT: { parentId: null } } // Ищем только подкатегории
    });

    console.log(`Обработка ${products.length} товаров...`);

    for (const product of products) {
        const name = product.name.toLowerCase();
        let targetCatId = null;

        // Очень простая логика для теста (можно расширить)
        if (name.includes('смеситель')) {
            if (name.includes('кухн')) targetCatId = categories.find(c => c.name === 'Для кухни')?.id;
            else if (name.includes('раковин')) targetCatId = categories.find(c => c.name === 'Для раковины')?.id;
            else targetCatId = categories.find(c => c.name === 'Для ванны')?.id;
        } 
        else if (name.includes('унитаз')) targetCatId = categories.find(c => c.name === 'Унитазы напольные')?.id;
        else if (name.includes('душ')) targetCatId = categories.find(c => c.name === 'Душевые системы')?.id;
        else if (name.includes('тумба')) targetCatId = categories.find(c => c.name === 'Тумбы с раковиной')?.id;
        else if (name.includes('сифон')) targetCatId = categories.find(c => c.name === 'Сифоны')?.id;

        if (targetCatId) {
            await prisma.product.update({
                where: { id: product.id },
                data: { categoryId: targetCatId }
            });
        }
    }

    console.log('--- КАТЕГОРИЗАЦИЯ ЗАВЕРШЕНА ---');
}

main().finally(() => prisma.$disconnect());
