import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ui/ProductCard'
import FilterSidebar from '@/components/layout/FilterSidebar'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal } from 'lucide-react'

interface CatalogPageProps {
  params: Promise<{ categorySlug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CatalogPage({ params, searchParams }: CatalogPageProps) {
  const { categorySlug } = await params
  const sParams = await searchParams

  const brandsFilter = typeof sParams.brands === 'string' ? sParams.brands.split(',') : []
  const sort = typeof sParams.sort === 'string' ? sParams.sort : 'popular'

  // Build where clause
  const where: any = {
    category: { slug: categorySlug }
  }

  if (brandsFilter.length > 0) {
    where.brand = { slug: { in: brandsFilter } }
  }

  // Simplified sorting for SQLite/Prisma relations
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

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug }
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="bg-surface min-h-screen">
      {/* Хлебные крошки */}
      <div className="container mx-auto px-6 py-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
        <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/catalog" className="hover:text-primary transition-colors">Каталог</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-primary font-medium">{category.name}</span>
      </div>

      <div className="container mx-auto px-6 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl text-primary mb-4 leading-tight uppercase tracking-tight">
              {category.name}
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed font-light">
              Откройте для себя нашу эксклюзивную коллекцию в категории «{category.name}». Премиальные решения, сочетающие в себе инновационные технологии и безупречный дизайн от ведущих мировых производителей.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-gray-400">
            <span>Найдено товаров: <span className="text-primary font-medium">{products.length}</span></span>
          </div>
        </div>

        <div className="flex gap-12">
          {/* Фильтры */}
          <FilterSidebar categorySlug={categorySlug} />

          {/* Сетка товаров */}
          <div className="flex-grow">
            {/* Кнопка фильтров для мобильных */}
            <button className="lg:hidden w-full mb-8 flex items-center justify-center gap-2 py-4 border border-gray-200 rounded-xl text-[10px] uppercase tracking-widest font-medium text-primary bg-white shadow-sm">
              <SlidersHorizontal className="w-4 h-4" /> Фильтры
            </button>

            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-3xl bg-white/50">
                <p className="text-gray-400 font-serif text-xl">В данной категории пока нет товаров</p>
                <Link href="/" className="inline-block mt-6 text-accent uppercase tracking-widest text-[10px] font-bold border-b border-accent pb-1">Вернуться на главную</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
