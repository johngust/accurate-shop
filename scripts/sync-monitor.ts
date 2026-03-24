import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- СИНХРОНИЗАЦИЯ МОНИТОРА ---');
    
    // 1. Считаем реальные товары
    const actualProducts = await prisma.product.count();
    
    // 2. Обнуляем/обновляем статус
    // total: 500 (наш текущий план)
    await prisma.$executeRaw`
        UPDATE ImportStatus 
        SET success = ${actualProducts}, 
            errors = 0, 
            reviews = 0,
            updatedAt = datetime('now')
        WHERE id = 'active'
    `;

    console.log(`Монитор синхронизирован! Теперь успешно = ${actualProducts}`);
}

main().finally(() => prisma.$disconnect());
