import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const testItems = [
    { sku: '3948500H', name: 'Унитаз напольный CUBE CERAMIC (AI Enhanced)', img: 'AI_3948500H.png' },
    { sku: '3924500H', name: 'Унитаз подвесной CUBE CERAMIC (AI Enhanced)', img: 'AI_3924500H.png' },
    { sku: '23844003', name: 'Смеситель PLUS раковина (AI Enhanced)', img: 'AI_23844003.png' },
    { sku: '23911001', name: 'Смеситель BauEdge раковина (AI Enhanced)', img: 'AI_23911001.png' },
    { sku: '27974IG0', name: 'Верхний душ Grandera Золото (AI Enhanced)', img: 'AI_27974IG0.png' },
    { sku: '27243001', name: 'Душевой гарнитур Euphoria (AI Enhanced)', img: 'AI_27243001.png' },
    { sku: '27993IG0', name: 'Душевой набор Хром/Золото (AI Enhanced)', img: 'AI_27993IG0.png' }
];

async function main() {
    // Не очищаем базу, просто добавляем эти товары
    const category = await prisma.category.upsert({
        where: { slug: 'ai-complex-test' },
        update: {},
        create: { name: 'ИИ: Сложные текстуры', slug: 'ai-complex-test' }
    });

    const brand = await prisma.brand.upsert({
        where: { slug: 'grohe' },
        update: {},
        create: { name: 'GROHE', slug: 'grohe' }
    });

    for (const item of testItems) {
        await prisma.product.create({
            data: {
                name: item.name,
                slug: `ai-test-${item.sku.toLowerCase()}`,
                description: `Сложная проверка текстуры для артикула ${item.sku}. Обработано Real-ESRGAN x4plus.`,
                brandId: brand.id,
                categoryId: category.id,
                attributes: '{}',
                variants: {
                    create: {
                        sku: `AI-${item.sku}`,
                        price: 150000,
                        stock: 5,
                        options: '{}'
                    }
                },
                media: {
                    create: {
                        url: `/uploads/products/${item.img}`,
                        type: 'IMAGE',
                        isPrimary: true
                    }
                }
            }
        });
    }

    console.log(`--- СОЗДАНО ${testItems.length} ТЕСТОВЫХ ТОВАРОВ ---`);
}

main().finally(() => prisma.$disconnect());
