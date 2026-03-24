import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    console.log('--- КАТАЛОГ ПОЛНОСТЬЮ ОЧИЩЕН ---');
}

main().finally(() => prisma.$disconnect());
