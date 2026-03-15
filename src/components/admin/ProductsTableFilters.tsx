'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Search, Filter, X } from 'lucide-react';

interface FilterProps {
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    currentQ: string;
    currentCategory: string;
    currentBrand: string;
    currentStock: string;
}

export default function ProductsTableFilters({
    categories,
    brands,
    currentQ,
    currentCategory,
    currentBrand,
    currentStock
}: FilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for immediate input feedback
    const [searchTerm, setSearchTerm] = useState(currentQ);

    // Debounce the search query to avoid spamming the server
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        params.delete('page'); // Reset to page 1 on new search
        router.push(`${pathname}?${params.toString()}`);
    }, 500);

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page'); // Reset to page 1 on new filter
        router.push(`${pathname}?${params.toString()}`);
    };

    const hasActiveFilters = currentCategory || currentBrand || currentStock;

    const clearFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('category');
        params.delete('brand');
        params.delete('stock');
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex flex-col xl:flex-row gap-3 bg-gray-900 border border-gray-800 p-3 rounded-xl shadow-lg flex-shrink-0">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e.target.value);
                    }}
                    placeholder="Быстрый поиск по названию или артикулу..."
                    className="w-full pl-9 pr-8 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                />
                {searchTerm && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            handleSearch('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap flex-grow gap-3 items-center">
                <div className="w-px h-6 bg-gray-800 hidden xl:block mx-1"></div>

                {/* Category Filter */}
                <select
                    value={currentCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer hover:border-gray-700 transition-colors max-w-[180px]"
                >
                    <option value="">Все категории</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                {/* Brand Filter */}
                <select
                    value={currentBrand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer hover:border-gray-700 transition-colors max-w-[160px]"
                >
                    <option value="">Все бренды</option>
                    {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>

                {/* Stock Status Filter (Visually prepared, functionality requires complex Prisma joining or denormalization) */}
                <select
                    value={currentStock}
                    onChange={(e) => handleFilterChange('stock', e.target.value)}
                    className="bg-gray-950 border border-gray-800 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 cursor-pointer hover:border-gray-700 transition-colors max-w-[160px]"
                >
                    <option value="">Наличие (Любое)</option>
                    <option value="in_stock">В наличии (&gt;5)</option>
                    <option value="low_stock">Заканчивается (≤5)</option>
                    <option value="out_of_stock">Нет в наличии (0)</option>
                </select>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors ml-auto xl:ml-0"
                    >
                        <X size={12} /> Сбросить
                    </button>
                )}
            </div>
        </div>
    );
}
