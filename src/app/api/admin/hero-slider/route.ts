import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: 'asc' },
  });
  return NextResponse.json(slides);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { id, title, subtitle, tagline, image, buttonText, link, order, isActive } = data;

    if (id) {
      // Update
      const slide = await prisma.heroSlide.update({
        where: { id },
        data: { title, subtitle, tagline, image, buttonText, link, order, isActive },
      });
      return NextResponse.json(slide);
    } else {
      // Create
      const slide = await prisma.heroSlide.create({
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
