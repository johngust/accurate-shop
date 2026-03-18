import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ФОРМИРОВАНИЕ ПРЕМЕАЛЬНОЙ ИЕРАРХИИ (BULAK + UX) ---');

    const tree = [
        {
            name: "Смесители",
            sub: ["Для раковины", "Для кухни", "Для ванны", "Для душа", "Для биде", "Скрытого монтажа", "Комплектующие"]
        },
        {
            name: "Душевая программа",
            sub: ["Душевые системы", "Душевые гарнитуры", "Верхние души", "Лейки", "Шланги", "Душевые поддоны"]
        },
        {
            name: "Санфаянс",
            sub: ["Унитазы", "Раковины", "Биде", "Инсталляции", "Кнопки смыва"]
        },
        {
            name: "Ванны",
            sub: ["Акриловые", "Каменные", "Чугунные", "Стальные"]
        },
        {
            name: "Мебель для ванной",
            sub: ["Тумбы с раковиной", "Шкафы-зеркала", "Зеркала", "Пеналы", "Столешницы"]
        },
        {
            name: "Водоотвод",
            sub: ["Душевые лотки", "Трапы", "Сифоны", "Выпуски и гофры"]
        },
        {
            name: "Аксессуары",
            sub: ["Держатели и крючки", "Полки", "Дозаторы и мыльницы", "Ершики"]
        },
        {
            name: "Кухонные мойки",
            sub: ["Из нержавеющей стали", "Из камня"]
        }
    ];

    function slugify(text: string) {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    }

    console.log("Очистка старого дерева...");
    // Убираем связи у товаров, чтобы не было ошибок
    await prisma.product.updateMany({ data: { categoryId: null } });
    await prisma.category.deleteMany({});

    for (const parent of tree) {
        const parentSlug = slugify(parent.name);
        const parentCat = await prisma.category.create({
            data: { 
                name: parent.name, 
                slug: parentSlug 
            }
        });

        for (const subName of parent.sub) {
            const subSlug = slugify(`${parent.name}-${subName}`);
            await prisma.category.create({
                data: {
                    name: subName,
                    slug: subSlug,
                    parentId: parentCat.id
                }
            });
        }
        console.log(`[OK] Создан раздел: ${parent.name} (+${parent.sub.length} подкатегорий)`);
    }

    console.log('--- НОВАЯ ИЕРАРХИЯ ПОСТРОЕНА УСПЕШНО ---');
}

main().finally(() => prisma.$disconnect());
