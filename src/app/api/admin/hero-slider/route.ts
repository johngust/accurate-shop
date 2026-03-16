import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  if (!(prisma as any).heroSlide) return NextResponse.json([]);
  
  const slides = await (prisma as any).heroSlide.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  try {
    if (!(prisma as any).heroSlide) throw new Error('Prisma model HeroSlide not found. Run npx prisma generate.');

    const data = await req.json();
    const { id, title, subtitle, tagline, image, buttonText, link, order, isActive } = data;

    if (id) {
      // Update
      const slide = await (prisma as any).heroSlide.update({
        where: { id },
        data: { title, subtitle, tagline, image, buttonText, link, order, isActive },
      });
      return NextResponse.json(slide);
    } else {
      // Create
      const slide = await (prisma as any).heroSlide.create({
        data: { title, subtitle, tagline, image, buttonText, link, order, isActive },
      });
      return NextResponse.json(slide);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(prisma as any).heroSlide) throw new Error('Prisma model HeroSlide not found');

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await (prisma as any).heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
