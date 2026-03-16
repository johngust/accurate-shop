import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ui/ProductCard'
import FilterSidebar from '@/components/layout/FilterSidebar'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'

interface AllProductsCatalogProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AllProductsCatalog({ searchParams }: AllProductsCatalogProps) {
  const sParams = await searchParams

  const brandsFilter = typeof sParams.brands === 'string' ? sParams.brands.split(',') : []
  const minPrice = typeof sParams.minPrice === 'string' ? Number(sParams.minPrice) : undefined
  const maxPrice = typeof sParams.maxPrice === 'string' ? Number(sParams.maxPrice) : undefined
  const sort = typeof sParams.sort === 'string' ? sParams.sort : 'popular'

  // Build where clause
  const where: any = {}

  if (brandsFilter.length > 0) {
    where.brand = { slug: { in: brandsFilter } }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.variants = {
      some: {
        price: {
          gte: minPrice,
          lte: maxPrice
        }
      }
    }
  }

  const sortOptions: any = {
    'popular': { name: 'asc' },
    'newest': { id: 'desc' },
    'price-asc': { name: 'asc' }, 
    'price-desc': { name: 'desc' },
  }

  const productsRaw = await prisma.product.findMany({
    where,
    include: {
      brand: true,
      media: true,
      variants: true,
      category: true
    },
    orderBy: sortOptions[sort] || { name: 'asc' }
  })

  const products = JSON.parse(JSON.stringify(productsRaw))

  return (
    <div className="bg-surface min-h-screen">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-6 py-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
        <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary font-medium">Полный каталог</span>
      </div>

      <div className="container mx-auto px-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-12">
          <div className="max-w-2xl">
            <h1 className="font-serif text-6xl text-primary mb-6 leading-tight uppercase tracking-tight">
              Полный <span className="italic text-accent">каталог</span>
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed font-light uppercase tracking-wider">
              Исследуйте наш полный ассортимент премиальной сантехники. От изысканных смесителей до роскошных ванн — всё для создания вашего идеального пространства.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold bg-white px-6 py-3 rounded-full shadow-sm border border-gray-50">
            <span>Найдено решений: <span className="text-primary font-black">{products.length}</span></span>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Фильтры */}
          <FilterSidebar />

          {/* Сетка товаров */}
          <div className="flex-grow">
            {/* Mobile filter trigger */}
            <button className="lg:hidden w-full mb-8 flex items-center justify-center gap-2 py-4 border border-gray-200 rounded-xl text-[10px] uppercase tracking-widest font-medium text-primary bg-white shadow-sm">
              <SlidersHorizontal className="w-4 h-4" /> Параметры
            </button>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 gap-y-12">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-[40px] bg-white/50 backdrop-blur-sm">
                <p className="text-gray-400 font-serif text-2xl italic">К сожалению, по вашему запросу ничего не найдено</p>
                <Link href="/catalog" className="inline-block mt-8 bg-primary text-white px-10 py-4 rounded-xl uppercase tracking-widest text-[10px] font-bold hover:bg-accent transition-all shadow-xl">Сбросить фильтры</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
