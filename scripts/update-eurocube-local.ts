import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.product.update({
        where: { slug: 'grohe-eurocube-23132000-premium' },
        data: {
            media: {
                deleteMany: {},
                create: {
                    url: '/uploads/products/AI_FIXED_23132000.jpg',
                    type: 'IMAGE',
                    isPrimary: true
                }
            }
        }
    });
    console.log('--- КАРТИНКА EUROCUBE ПРИВЯЗАНА ЛОКАЛЬНО ---');
}

main().finally(() => prisma.$disconnect());
