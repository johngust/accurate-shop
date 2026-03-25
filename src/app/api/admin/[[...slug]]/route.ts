import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = "edge";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const action = slug?.[0];

  try {
    // 1. STATS
    if (action === 'stats') {
      const totalProducts = await prisma.product.count();
      return NextResponse.json({
        success: true,
        data: {
          totalProducts,
          importStatus: { success: 0, errors: 0, reviews: 0, lastSku: 'N/A' },
        },
      });
    }

    // 2. DEALS
    if (action === 'deals') {
      const deals = await prisma.dealOfTheDay.findMany({
        include: { product: { include: { brand: true, media: true, variants: true } } }
      });
      return NextResponse.json({ success: true, data: deals });
    }

    // 3. HERO SLIDER
    if (action === 'hero-slider') {
      const slides = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });
      return NextResponse.json({ success: true, data: slides });
    }

    return NextResponse.json({ error: 'Action not found' }, { status: 404 });
  } catch (error: any) {
    console.error(`API Error (${action}):`, error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const action = slug?.[0];

    try {
        // BULK DELETE
        if (action === 'products' && slug?.[1] === 'bulk-delete') {
            const { ids } = await req.json();
            if (!ids || !Array.isArray(ids)) return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
            
            await prisma.product.deleteMany({ where: { id: { in: ids } } });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
