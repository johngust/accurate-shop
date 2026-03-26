import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
    Plus, 
    Edit, 
    Trash2, 
    ExternalLink, 
    Package, 
    Layers, 
    Tag, 
    AlertCircle,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Search
} from 'lucide-react';
import ProductsTableFilters from '@/components/admin/ProductsTableFilters';
import Pagination from '@/components/admin/Pagination';
import BulkDeleteButton from '@/components/admin/BulkDeleteButton';

export const runtime = 'edge';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
    const params = await searchParams;

    const queryParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string') queryParams[key] = value;
    });

    const page = Number(params.page) || 1;
    const pageSize = 10;
    const query = (params.q as string) || '';
    const categoryId = (params.category as string) || '';
    const brandId = (params.brand as string) || '';

    let products: any[] = [];
    let totalCount = 0;
    let categories: any[] = [];
    let brands: any[] = [];
    let totalPages = 0;

    try {
        const where: any = {
            OR: [
                { name: { contains: query } },
                { slug: { contains: query } },
                { variants: { some: { sku: { contains: query } } } }
            ]
        };

        if (categoryId) where.categoryId = categoryId;
        if (brandId) where.brandId = brandId;

        [products, totalCount, categories, brands] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true, brand: true, variants: true, media: true },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { name: 'asc' }
            }),
            prisma.product.count({ where }),
            prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
            prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
        ]);

        totalPages = Math.ceil(totalCount / pageSize);
    } catch (e) {
        products = [];
        totalCount = 0;
        categories = [];
        brands = [];
        totalPages = 0;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif text-white uppercase tracking-tight">Управление товарами</h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest text-[10px]">Всего позиций в базе: {totalCount}</p>
                </div>
                <div className="flex items-center gap-3">
                    <BulkDeleteButton />
                    <Link href="/admin/products/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95 shrink-0">
                        <Plus size={16} /> Добавить товар
                    </Link>
                </div>
            </div>

            <div className="space-y-4 flex flex-col">
                <ProductsTableFilters 
                    categories={categories} 
                    brands={brands} 
                    currentQ={query}
                    currentCategory={categoryId}
                    currentBrand={brandId}
                    currentStock=""
                />

                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[11px] uppercase text-gray-400 tracking-wider font-semibold bg-gray-950 border-b border-gray-800">
                                    <th className="px-4 py-4 min-w-[300px]">Товар / Артикул</th>
                                    <th className="px-4 py-4">Категория</th>
                                    <th className="px-4 py-4">Бренд</th>
                                    <th className="px-4 py-4">Цена</th>
                                    <th className="px-4 py-4">Наличие</th>
                                    <th className="px-4 py-4 text-center w-32">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {products.map((p) => {
                                    const mainVariant = p.variants[0];
                                    const totalStock = p.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
                                    
                                    return (
                                        <tr key={p.id} className="group hover:bg-gray-800/40 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-14 bg-gray-950 rounded border border-gray-800 flex-shrink-0 overflow-hidden relative group-hover:border-gray-700 transition-colors">
                                                        {p.media[0]?.url ? (
                                                            <img src={p.media[0].url} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                        ) : (
                                                            <Package size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-gray-200 truncate group-hover:text-blue-400 transition-colors">{p.name}</span>
                                                        <span className="text-[10px] font-mono text-gray-500 uppercase mt-0.5">{mainVariant?.sku || 'Без артикула'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                                    <Layers size={14} className="text-gray-600" />
                                                    {p.category?.name || 'Без категории'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                                    <Tag size={14} className="text-gray-600" />
                                                    {p.brand?.name || 'Без бренда'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-200">{Number(mainVariant?.price).toLocaleString()} ₸</span>
                                                    {p.variants.length > 1 && (
                                                        <span className="text-[9px] text-gray-500 uppercase font-bold">+{p.variants.length - 1} вариантов</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md ${totalStock === 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                    {totalStock === 0 ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                                                    {totalStock} шт.
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link href={`/admin/products/${p.id}`} className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="bg-gray-950 px-4 py-4 border-t border-gray-800">
                        <Pagination totalPages={totalPages} currentPage={page} queryParams={queryParams} baseUrl="/admin/products" />
                    </div>
                </div>
            </div>
        </div>
    );
}
