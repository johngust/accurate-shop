import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Очищаем базу на всякий случай
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});

    // Создаем тестовый бренд и категорию
    const category = await prisma.category.upsert({
        where: { slug: 'ai-test' },
        update: {},
        create: { name: 'ИИ Тест', slug: 'ai-test' }
    });

    const brand = await prisma.brand.upsert({
        where: { slug: 'accurate' },
        update: {},
        create: { name: 'Accurate', slug: 'accurate' }
    });

    // Создаем товар
    await prisma.product.create({
        data: {
            name: 'ТЕСТОВОЕ УЛУЧШЕНИЕ ИИ (RTX 4060 Ti)',
            slug: 'ai-test-product',
            description: 'Этот товар был обработан нейросетью Real-ESRGAN x4plus. Сравните четкость линий и отсутствие шумов.',
            brandId: brand.id,
            categoryId: category.id,
            attributes: '{}',
            variants: {
                create: {
                    sku: 'AI-001',
                    price: 99999,
                    stock: 1,
                    options: '{}'
                }
            },
            media: {
                create: {
                    url: '/uploads/products/AI_TEST_PROD.png',
                    type: 'IMAGE',
                    isPrimary: true
                }
            }
        }
    });

    console.log('--- ТЕСТОВЫЙ ТОВАР СОЗДАН ---');
    console.log('Зайдите на http://localhost:3000, чтобы увидеть результат.');
}

main().finally(() => prisma.$disconnect());
