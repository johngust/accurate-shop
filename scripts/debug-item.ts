import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const product = await prisma.product.findFirst({
        where: { name: { contains: 'C 0510' } },
        include: { media: true, variants: true }
    });

    console.log('--- DEBUG PRODUCT C0510 ---');
    console.log('Name:', product?.name);
    console.log('Media:', JSON.stringify(product?.media, null, 2));
    console.log('Variants SKUs:', product?.variants.map(v => v.sku));
}

main().finally(() => prisma.$disconnect());
