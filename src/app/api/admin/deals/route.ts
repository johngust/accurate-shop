import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const runtime = "edge";

export async function GET() {
  try {
    const deals = await prisma.dealOfTheDay.findMany({
      include: {
        product: {
          include: {
            brand: true,
            media: true,
            variants: true
          }
        }
      }
    });
    return NextResponse.json(deals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { productId, discount, endDate, isActive, id } = data;

    if (id) {
      const deal = await prisma.dealOfTheDay.update({
        where: { id },
        data: { discount, endDate: endDate ? new Date(endDate) : null, isActive }
      });
      return NextResponse.json(deal);
    } else {
      const deal = await prisma.dealOfTheDay.create({
        data: { productId, discount, endDate: endDate ? new Date(endDate) : null, isActive }
      });
      return NextResponse.json(deal);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.dealOfTheDay.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
