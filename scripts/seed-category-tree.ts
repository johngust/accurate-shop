import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ПОЛНОЕ ВОССТАНОВЛЕНИЕ ДЕРЕВА КАТЕГОРИЙ ---');

    const tree = [
        { name: "Смесители", sub: ["Для раковины", "Для кухни", "Для ванны", "Для биде", "Встраиваемые системы"] },
        { name: "Душевая программа", sub: ["Душевые системы", "Душевые гарнитуры", "Верхние души", "Лейки и шланги"] },
        { name: "Санфаянс", sub: ["Унитазы", "Раковины", "Биде", "Инсталляции"] },
        { name: "Мебель для ванной", sub: ["Тумбы с раковиной", "Зеркальные шкафы", "Зеркала", "Пеналы"] },
        { name: "Водоотвод", sub: ["Душевые лотки", "Трапы", "Сифоны", "Гофры и трубы"] },
        { name: "Аксессуары", sub: ["Держатели и крючки", "Мыльницы и дозаторы", "Ершики", "Полки"] }
    ];

    function slugify(text: string) {
        return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    }

    for (const parent of tree) {
        const pSlug = slugify(parent.name);
        const pCat = await prisma.category.upsert({
            where: { slug: pSlug },
            update: { name: parent.name },
            create: { name: parent.name, slug: pSlug }
        });

        for (const sub of parent.sub) {
            const sSlug = slugify(`${parent.name}-${sub}`);
            await prisma.category.upsert({
                where: { slug: sSlug },
                update: { name: sub, parentId: pCat.id },
                create: { name: sub, slug: sSlug, parentId: pCat.id }
            });
        }
        console.log(`[OK] Восстановлен раздел: ${parent.name}`);
    }
}

main().finally(() => prisma.$disconnect());
