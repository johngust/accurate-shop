'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    queryParams?: Record<string, string>;
}

export default function Pagination({ currentPage, totalPages, baseUrl, queryParams = {} }: PaginationProps) {
    if (totalPages <= 1) return null;

    const buildUrl = (pageNumber: number) => {
        const params = new URLSearchParams();

        // Add existing params
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        // Add or update page param
        if (pageNumber > 1) {
            params.set('page', pageNumber.toString());
        } else {
            params.delete('page');
        }

        const queryString = params.toString();
        return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
    };

    // Calculate visible pages (max 5 buttons)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    const pages = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
    );

    return (
        <div className="flex items-center gap-1">
            {/* First Page */}
            <Link
                href={buildUrl(1)}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${currentPage === 1
                        ? 'text-gray-600 pointer-events-none'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                title="Первая страница"
            >
                <ChevronsLeft size={16} />
            </Link>

            {/* Prev Page */}
            <Link
                href={buildUrl(currentPage - 1)}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors mr-2 ${currentPage === 1
                        ? 'text-gray-600 pointer-events-none'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                title="Предыдущая страница"
            >
                <ChevronLeft size={16} />
            </Link>

            {/* Numbered Pages */}
            {pages.map(page => (
                <Link
                    key={page}
                    href={buildUrl(page)}
                    className={`min-w-[28px] h-7 px-2 rounded-md flex items-center justify-center text-xs font-semibold transition-colors ${currentPage === page
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                >
                    {page}
                </Link>
            ))}

            {/* Next Page */}
            <Link
                href={buildUrl(currentPage + 1)}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ml-2 ${currentPage === totalPages
                        ? 'text-gray-600 pointer-events-none'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                title="Следующая страница"
            >
                <ChevronRight size={16} />
            </Link>

            {/* Last Page */}
            <Link
                href={buildUrl(totalPages)}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${currentPage === totalPages
                        ? 'text-gray-600 pointer-events-none'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                title="Последняя страница"
            >
                <ChevronsRight size={16} />
            </Link>
        </div>
    );
}
