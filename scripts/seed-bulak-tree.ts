import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ФОРМИРОВАНИЕ МАКСИМАЛЬНОЙ ИЕРАРХИИ (BULAK STYLE) ---');

    const tree = [
        {
            name: "Смесители",
            sub: ["Для раковины", "Для кухни", "Для ванны", "Для душа", "Для биде", "Встраиваемые смесители", "На борт ванны", "Напольные смесители", "Комплектующие"]
        },
        {
            name: "Душевая программа",
            sub: ["Душевые системы", "Душевые гарнитуры", "Верхние души", "Гигиенические души", "Лейки и шланги", "Душевые поддоны"]
        },
        {
            name: "Санфаянс",
            sub: ["Унитазы напольные", "Унитазы подвесные", "Биде", "Писсуары", "Раковины", "Инсталляции", "Кнопки смыва"]
        },
        {
            name: "Мебель для ванной",
            sub: ["Тумбы с раковиной", "Шкафы-зеркала", "Зеркала", "Пеналы", "Комоды и полки", "Столешницы"]
        },
        {
            name: "Ванны",
            sub: ["Акриловые", "Чугунные", "Стальные", "Из литьевого мрамора"]
        },
        {
            name: "Водоотвод",
            sub: ["Душевые лотки", "Трапы", "Сифоны", "Выпуски", "Гофры и трубы"]
        },
        {
            name: "Аксессуары",
            sub: ["Держатели", "Крючки", "Мыльницы и дозаторы", "Ершики", "Полки"]
        },
        {
            name: "Кухонные мойки",
            sub: ["Из нержавеющей стали", "Из камня", "Аксессуары для моек"]
        }
    ];

    function slugify(text: string) {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    }

    for (const parent of tree) {
        const pSlug = slugify(parent.name);
        const parentCat = await prisma.category.upsert({
            where: { slug: pSlug },
            update: { name: parent.name },
            create: { name: parent.name, slug: pSlug }
        });

        for (const sub of parent.sub) {
            const sSlug = slugify(`${parent.name}-${sub}`);
            await prisma.category.upsert({
                where: { slug: sSlug },
                update: { name: sub, parentId: parentCat.id },
                create: { name: sub, slug: sSlug, parentId: parentCat.id }
            });
        }
        console.log(`[OK] Секция: ${parent.name} (+${parent.sub.length} подкатегорий)`);
    }

    console.log('--- ПОЛНАЯ ИЕРАРХИЯ ПОСТРОЕНА ---');
}

main().finally(() => prisma.$disconnect());
