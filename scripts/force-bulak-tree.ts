import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ПРИНУДИТЕЛЬНОЕ СОЗДАНИЕ ДЕРЕВА BULAK.KZ ---');

    const tree = [
        {
            name: "Смесители",
            sub: ["Для раковины", "Для кухни", "Для ванны", "Для душа", "Для биде", "Встраиваемые системы"]
        },
        {
            name: "Душевая программа",
            sub: ["Душевые системы", "Душевые гарнитуры", "Верхние души", "Лейки и шланги"]
        },
        {
            name: "Санфаянс",
            sub: ["Унитазы напольные", "Унитазы подвесные", "Биде", "Раковины", "Инсталляции"]
        },
        {
            name: "Мебель для ванной",
            sub: ["Тумбы с раковиной", "Шкафы-зеркала", "Зеркала", "Пеналы"]
        },
        {
            name: "Водоотвод",
            sub: ["Душевые лотки", "Трапы", "Сифоны", "Выпуски и гофры"]
        },
        {
            name: "Аксессуары",
            sub: ["Держатели", "Крючки", "Мыльницы и дозаторы", "Ершики", "Полки"]
        }
    ];

    function slugify(text: string) {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    }

    console.log("Полная очистка категорий...");
    await prisma.product.updateMany({ data: { categoryId: null } });
    await prisma.category.deleteMany({});

    for (const parent of tree) {
        const parentCat = await prisma.category.create({
            data: { 
                name: parent.name, 
                slug: slugify(parent.name) 
            }
        });

        for (const subName of parent.sub) {
            await prisma.category.create({
                data: {
                    name: subName,
                    slug: slugify(`${parent.name}-${subName}`),
                    parentId: parentCat.id
                }
            });
        }
        console.log(`[OK] Секция: ${parent.name}`);
    }

    console.log('--- ДЕРЕВО BULAK.KZ СОЗДАНО ---');
}

main().finally(() => prisma.$disconnect());
