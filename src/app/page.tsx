import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, ShieldCheck, Clock, Award } from 'lucide-react'
import CategoryGrid from '@/components/ui/CategoryGrid'
import ProductSlider from '@/components/ui/ProductSlider'
import FilterSidebar from '@/components/layout/FilterSidebar'
import ProductCard from '@/components/ui/ProductCard'
import HeroSlider from '@/components/ui/HeroSlider'

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
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

  const [products, slides] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        media: true,
        variants: true,
        category: true
      },
      take: 12,
      orderBy: sortOptions[sort] || { name: 'asc' }
    }),
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
  ])

  return (
    <div className="flex flex-col font-sans">
      <HeroSlider slides={slides} />

      <div className="container mx-auto px-6 py-20">
        <div className="flex gap-12">
          {/* Фильтры */}
          <FilterSidebar />

          {/* Сетка товаров */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <h2 className="font-serif text-4xl text-primary uppercase tracking-tight">
                Наш <span className="italic text-accent">ассортимент</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <CategoryGrid />

      <section className="bg-surface py-32 border-y border-gray-100 font-sans">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-20">
          <div className="flex flex-col items-center text-center gap-6 group">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform">
              <Award className="w-8 h-8 text-accent" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary">Премиум бренды</div>
            <p className="text-[10px] text-gray-400 uppercase leading-relaxed max-w-[180px]">Прямые поставки из Европы</p>
          </div>
          <div className="flex flex-col items-center text-center gap-6 group">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary">Гарантия качества</div>
            <p className="text-[10px] text-gray-400 uppercase leading-relaxed max-w-[180px]">До 10 лет гарантии</p>
          </div>
          <div className="flex flex-col items-center text-center gap-6 group">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform">
              <Clock className="w-8 h-8 text-accent" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary">Быстрая доставка</div>
            <p className="text-[10px] text-gray-400 uppercase leading-relaxed max-w-[180px]">Собственная логистика</p>
          </div>
          <div className="flex flex-col items-center text-center gap-6 group">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform">
              <Star className="w-8 h-8 text-accent" />
            </div>
            <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary">B2B сервис</div>
            <p className="text-[10px] text-gray-400 uppercase leading-relaxed max-w-[180px]">Условия для дизайнеров</p>
          </div>
        </div>
      </section>

      <ProductSlider 
        title={<>Бестселлеры <span className="italic text-accent">коллекций</span></>} 
        subtitle="Выбор ценителей" 
        products={products} 
      />

      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-primary rounded-luxury overflow-hidden relative min-h-[600px] flex items-center">
            <div className="absolute inset-0 z-0">
              <Image 
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000" 
                alt="Accurate B2B Interior"
                fill
                className="object-cover opacity-20 grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent"></div>
            </div>
            <div className="relative z-10 px-12 md:px-32 max-w-3xl font-sans">
              <h2 className="font-serif text-5xl md:text-7xl text-white mb-12 leading-tight uppercase tracking-tight italic">
                Мы создаем <span className="text-accent underline decoration-1 underline-offset-8">возможности</span> для вашего бизнеса
              </h2>
              <p className="text-white/60 text-sm mb-16 uppercase tracking-[0.2em] leading-loose font-medium">
                Индивидуальное ценообразование, приоритетная доставка и профессиональное сопровождение каждого объекта.
              </p>
              <Link href="/b2b" className="btn-accent inline-flex h-20 items-center px-16 text-[11px] uppercase tracking-[0.3em] font-bold">
                Стать партнером
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
