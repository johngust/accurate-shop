import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE() {
    try {
        // Удаляем всё в правильном порядке (связанные данные сначала)
        await prisma.$transaction([
            prisma.media.deleteMany({}),
            prisma.productVariant.deleteMany({}),
            prisma.dealOfTheDay.deleteMany({}),
            prisma.productRelation.deleteMany({}),
            prisma.product.deleteMany({}),
            // Бренды и категории оставляем, так как они могут быть полезны
        ]);

        return NextResponse.json({ message: 'Все товары успешно удалены' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
