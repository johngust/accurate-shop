import { prisma } from '@/lib/prisma';
import { Tag, Plus, Edit, Package } from 'lucide-react';

export default async function AdminBrandsPage() {
    let brands: any[] = []
    try {
        brands = await prisma.brand.findMany({
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });
    } catch (e) {
        brands = []
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Бренды</h1>
                    <p className="text-gray-400 text-sm mt-1">{brands.length} брендов в базе</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                    <Plus size={16} /> Добавить бренд
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {brands.map((brand) => (
                    <div key={brand.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                                <Tag size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                            </div>
                            <button className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-gray-700 transition-colors">
                                <Edit size={14} />
                            </button>
                        </div>

                        <h3 className="font-bold text-white mb-1">{brand.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Package size={12} /> {brand._count.products} товаров
                        </p>
                    </div>
                ))}

                {brands.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-gray-900 rounded-xl border border-gray-800 text-gray-500">
                        <Tag size={36} className="mx-auto mb-3 text-gray-700" />
                        <p>Брендов пока нет</p>
                    </div>
                )}
            </div>
        </div>
    );
}
