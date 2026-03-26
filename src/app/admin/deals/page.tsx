import { prisma } from '@/lib/prisma';
import DealsClient from './DealsClient';

export default async function AdminDealsPage() {
  let serializedDeals: any[] = []
  let products: any[] = []
  try {
    const deals = (prisma as any).dealOfTheDay
      ? await (prisma as any).dealOfTheDay.findMany({
          include: {
            product: {
              include: {
                brand: true,
                media: true,
                variants: true
              }
            }
          }
        })
      : [];

    products = await prisma.product.findMany({
      select: { id: true, name: true, slug: true },
      take: 100
    });

    serializedDeals = JSON.parse(JSON.stringify(deals));
  } catch (e) {
    serializedDeals = []
    products = []
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Товары дня</h2>
        <p className="text-gray-400 text-sm mt-1">Управляйте акционными предложениями на главной странице</p>
      </div>

      <DealsClient initialDeals={serializedDeals} products={products} />
    </div>
  );
}
