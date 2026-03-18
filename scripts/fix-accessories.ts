import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ИСПРАВЛЕНИЕ КАТЕГОРИИ АКСЕССУАРЫ ---');

    const parentName = "Аксессуары";
    const subCategories = ["Держатели", "Крючки", "Мыльницы и дозаторы", "Ершики", "Полки"];

    function slugify(text: string) {
        return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
    }

    // 1. Находим или создаем родителя
    const parentCat = await prisma.category.upsert({
        where: { slug: slugify(parentName) },
        update: { name: parentName },
        create: { name: parentName, slug: slugify(parentName) }
    });

    // 2. Создаем подкатегории
    for (const subName of subCategories) {
        const subSlug = slugify(`${parentName}-${subName}`);
        await prisma.category.upsert({
            where: { slug: subSlug },
            update: { name: subName, parentId: parentCat.id },
            create: { 
                name: subName, 
                slug: subSlug,
                parentId: parentCat.id
            }
        });
    }

    console.log(`[OK] Подкатегории для '${parentName}' успешно добавлены.`);
}

main().finally(() => prisma.$disconnect());
