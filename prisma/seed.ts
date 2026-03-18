import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ГЛОБАЛЬНЫЙ СИД: КАТАЛОГ ACCURATE (BULAK STYLE) ---');

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

    for (const parent of tree) {
        const pSlug = slugify(parent.name);
        const parentCat = await prisma.category.upsert({
            where: { slug: pSlug },
            update: { name: parent.name },
            create: { name: parent.name, slug: pSlug }
        });

        for (const subName of parent.sub) {
            const sSlug = slugify(`${parent.name}-${subName}`);
            await prisma.category.upsert({
                where: { slug: sSlug },
                update: { name: subName, parentId: parentCat.id },
                create: { 
                    name: subName, 
                    slug: sSlug,
                    parentId: parentCat.id
                }
            });
        }
    }

    // Создаем базовые настройки сайта
    await prisma.siteSettings.upsert({
        where: { id: 'global' },
        update: {},
        create: {
            headerPhone: "+7 (777) 000-00-00",
            footerAbout: "Accurate - премиальная сантехника для вашего дома.",
            footerEmail: "info@accurate.kz"
        }
    });

    console.log('--- СИД ЗАВЕРШЕН: БАЗА НАПОЛНЕНА ИЕРАРХИЕЙ ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
