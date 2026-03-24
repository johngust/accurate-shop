import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ГЛОБАЛЬНАЯ ИНТЕЛЛЕКТУАЛЬНАЯ СОРТИРОВКА ---');

    const rules = [
        {
            parent: "Смесители",
            keywords: ["шланг", "картридж", "излив", "аэратор", "эксцентрик", "внутренняя часть", "скрытая часть", "удлинитель"],
            compName: "Комплектующие"
        },
        {
            parent: "Ванны",
            keywords: ["ножки", "каркас", "панель", "экран", "ручка для ванн", "подголовник"],
            compName: "Комплектующие"
        },
        {
            parent: "Раковины",
            keywords: ["пьедестал", "полупьедестал", "кронштейн", "крепление для раковин"],
            compName: "Комплектующие"
        },
        {
            parent: "Мойки",
            keywords: ["дозатор", "корзина", "коландер", "разделочная доска", "коврик для мойки"],
            compName: "Комплектующие"
        },
        {
            parent: "Душевые системы",
            keywords: ["держатель лейки", "шланг для душа", "штанга", "отражатель", "кронштейн для душа"],
            compName: "Комплектующие"
        }
    ];

    for (const rule of rules) {
        const parentCat = await prisma.category.findFirst({
            where: { name: { contains: rule.parent } }
        });

        if (!parentCat) continue;

        const compCat = await prisma.category.upsert({
            where: { slug: `${parentCat.slug}-parts` },
            update: { name: rule.compName },
            create: { 
                name: rule.compName, 
                slug: `${parentCat.slug}-parts`,
                parentId: parentCat.id
            }
        });

        console.log(`\nОбработка: ${parentCat.name} -> ${compCat.name}`);

        const products = await prisma.product.findMany({
            where: { categoryId: parentCat.id }
        });

        let movedCount = 0;
        for (const p of products) {
            const nameL = p.name.toLowerCase();
            if (rule.keywords.some(k => nameL.includes(k.toLowerCase()))) {
                await prisma.product.update({
                    where: { id: p.id },
                    data: { categoryId: compCat.id }
                });
                console.log(`  [ПЕРЕЕЗД] ${p.name}`);
                movedCount++;
            }
        }
        console.log(`Итого: ${movedCount} товаров перенесено.`);
    }

    console.log('\n--- ГЛОБАЛЬНАЯ СОРТИРОВКА ЗАВЕРШЕНА ---');
}

main().finally(() => prisma.$disconnect());
