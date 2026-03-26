import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FolderTree, Plus, Edit, ChevronRight } from 'lucide-react';

export default async function AdminCategoriesPage() {
    let categories: any[] = []
    let totalCategories = 0
    try {
        categories = await prisma.category.findMany({
            include: {
                children: { include: { _count: { select: { products: true } } } },
                _count: { select: { products: true } },
            },
            where: { parentId: null },
            orderBy: { name: 'asc' },
        });
        totalCategories = await prisma.category.count();
    } catch (e) {
        categories = []
        totalCategories = 0
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Категории</h1>
                    <p className="text-gray-400 text-sm mt-1">{totalCategories} категорий и подкатегорий</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">
                    <Plus size={16} /> Добавить категорию
                </button>
            </div>

            <div className="space-y-3">
                {categories.map((cat) => (
                    <div key={cat.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                        {/* Parent Category */}
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <FolderTree size={15} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white text-sm">{cat.name}</p>
                                    <p className="text-xs text-gray-500">/catalog/{cat.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">{cat._count.products} товаров</span>
                                {cat.children.length > 0 && (
                                    <span className="text-xs text-gray-500">{cat.children.length} подкатегорий</span>
                                )}
                                <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                                    <Edit size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Children */}
                        {cat.children.length > 0 && (
                            <div className="border-t border-gray-800 divide-y divide-gray-800/60">
                                {cat.children.map((child: any) => (
                                    <div key={child.id} className="flex items-center justify-between px-6 py-3 pl-14 bg-gray-950/30">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <ChevronRight size={13} className="text-gray-600" />
                                            <span className="text-sm">{child.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500">{child._count.products} товаров</span>
                                            <button className="p-1.5 rounded text-gray-600 hover:text-gray-400 hover:bg-gray-700 transition-colors">
                                                <Edit size={13} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800 text-gray-500">
                        <FolderTree size={36} className="mx-auto mb-3 text-gray-700" />
                        <p>Категорий пока нет</p>
                    </div>
                )}
            </div>
        </div>
    );
}
