import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.media.deleteMany({
        where: { product: { slug: 'ai-test-27974ig0' } }
    });

    await prisma.product.update({
        where: { slug: 'ai-test-27974ig0' },
        data: {
            name: 'Верхний душ GROHE Grandera Золото (ОРИГИНАЛ ИЗ СЕТИ)',
            media: {
                create: {
                    url: '/uploads/products/HQ_27974IG0.jpg',
                    type: 'IMAGE',
                    isPrimary: true
                }
            }
        }
    });

    console.log('--- ФОТО ЗАМЕНЕНО НА ОРИГИНАЛ ---');
}

main().finally(() => prisma.$disconnect());
