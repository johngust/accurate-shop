import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalProducts = await prisma.product.count();
    /*
    const importStatus = await prisma.importStatus.findUnique({
      where: { id: 'active' },
    });
    */

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        importStatus: {
          success: 0,
          errors: 0,
          reviews: 0,
          lastSku: 'N/A',
        },
      },
    });
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
