'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        setIsOpen(true);
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-xl" ref={containerRef}>
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="ПОИСК ПО КАТАЛОГУ (НАЗВАНИЕ, БРЕНД ИЛИ АРТИКУЛ)..."
          className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-14 pr-4 text-[11px] uppercase tracking-widest text-primary focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all placeholder:text-gray-300 shadow-sm group-hover:shadow-md"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-accent transition-colors" />
        {isLoading && (
          <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-spin" />
        )}
      </form>

      {/* Results Dropdown */}
      {isOpen && (results.length > 0 || !isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[24px] shadow-premium-lg overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-2">
            {results.length > 0 ? (
              <>
                <div className="px-4 py-3 text-[9px] uppercase tracking-[0.2em] text-accent font-black border-b border-gray-50 mb-2">
                  Быстрые результаты
                </div>
                {results.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/catalog?search=${product.sku || product.name}`}
                    onClick={() => {
                      setQuery(product.name);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors group"
                  >
                    <div className="relative w-14 h-14 bg-surface rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      {product.media?.[0]?.url ? (
                        <Image
                          src={product.media[0].url}
                          alt={product.name}
                          fill
                          className="object-contain p-2 group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300 uppercase">HQ</div>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] text-accent uppercase tracking-wider font-bold truncate">
                        {product.brand?.name}
                      </p>
                      <p className="text-sm text-primary font-bold truncate">
                        {product.name}
                      </p>
                      <p className="text-[9px] text-gray-400 font-mono">
                        SKU: {product.variants?.[0]?.sku}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 pr-2">
                      <p className="text-xs text-primary font-black">
                        {product.variants?.[0]?.price?.toLocaleString()} ₸
                      </p>
                    </div>
                  </Link>
                ))}
                <Link 
                  href={`/catalog?search=${encodeURIComponent(query)}`}
                  className="block text-center py-4 text-[10px] uppercase tracking-widest text-primary/40 hover:text-accent transition-colors border-t border-gray-50 mt-2 font-bold"
                >
                  Показать все результаты →
                </Link>
              </>
            ) : (
              <div className="p-10 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">По вашему запросу ничего не найдено</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
