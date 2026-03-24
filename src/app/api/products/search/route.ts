import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { brand: { name: { contains: query } } },
          { variants: { some: { sku: { contains: query } } } }
        ]
      },
      include: {
        media: { where: { isPrimary: true }, take: 1 },
        variants: { take: 1 },
        brand: true
      },
      take: 5
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
