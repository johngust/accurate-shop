import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const targetCat = await prisma.category.findFirst({
        where: { name: "Тумбы с раковиной" }
    });

    if (targetCat) {
        const res = await prisma.product.updateMany({
            where: { 
                OR: [
                    { name: { contains: "Тумба" } },
                    { name: { contains: "тумба" } }
                ]
            },
            data: { categoryId: targetCat.id }
        });
        console.log(`--- УСПЕХ: ${res.count} ТУМБ ПРИВЯЗАНО К КАТЕГОРИИ '${targetCat.name}' ---`);
    } else {
        console.log("Категория 'Тумбы с раковиной' не найдена.");
    }
}

main().finally(() => prisma.$disconnect());
