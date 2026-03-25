import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowRight, Star, ShieldCheck, Clock, Award } from 'lucide-react'
import CategoryGrid from '@/components/ui/CategoryGrid'
import ProductSlider from '@/components/ui/ProductSlider'
import ProductCard from '@/components/ui/ProductCard'
import HeroSlider from '@/components/ui/HeroSlider'
import BrandGrid from '@/components/ui/BrandGrid'
import BrandTicker from '@/components/ui/BrandTicker'
import QualitySpotlight from '@/components/ui/QualitySpotlight'
import ContactFloating from '@/components/ui/ContactFloating'

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = 'force-dynamic';
export const runtime = "edge";

export default async function HomePage({ searchParams }: HomePageProps) {
  // Получаем товары для витрины
  const productsRaw = await prisma.product.findMany({
    include: {
      brand: true,
      media: true,
      variants: true,
      category: true
    },
    take: 10,
    orderBy: { id: 'desc' }
  })

  const products = JSON.parse(JSON.stringify(productsRaw))

  return (
    <div className="flex flex-col font-sans bg-white relative">
      {/* 1. Слайдер */}
      <HeroSlider slides={[]} />
      
      {/* 2. Движущаяся полоса (НОВОЕ) */}
      <BrandTicker />
      
      {/* 3. Сетка брендов */}
      <BrandGrid />

      {/* 4. Витрина товаров */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-[1920px]">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-[10px] uppercase tracking-[0.5em] text-accent font-bold mb-4 text-glow">Новые поступления</h2>
            <h3 className="font-serif text-5xl md:text-6xl text-primary uppercase tracking-tighter italic">
              Elite <span className="text-accent underline decoration-1 underline-offset-8">Gallery</span>
            </h3>
            <p className="text-gray-400 text-[11px] uppercase tracking-[0.3em] font-bold mt-6">Elite Content & HD Quality</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>

          <div className="mt-24 text-center">
            <Link href="/catalog" className="inline-flex items-center gap-6 text-[12px] uppercase tracking-[0.4em] font-black border-b-2 border-accent pb-3 hover:text-accent transition-all hover:gap-8">
              Смотреть весь каталог <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Категории */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
            <CategoryGrid />
        </div>
      </div>

      {/* 7. Преимущества */}
      <section className="bg-white py-24 md:py-32 border-y border-gray-100">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-20 text-center">
          <div className="flex flex-col items-center gap-4">
            <Award className="text-accent" size={32} />
            <span className="text-[11px] uppercase tracking-widest font-black">Премиум бренды</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <ShieldCheck className="text-accent" size={32} />
            <span className="text-[11px] uppercase tracking-widest font-black">Гарантия качества</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Clock className="text-accent" size={32} />
            <span className="text-[11px] uppercase tracking-widest font-black">Быстрая доставка</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Star className="text-accent" size={32} />
            <span className="text-[11px] uppercase tracking-widest font-black">B2B Сервис</span>
          </div>
        </div>
      </section>

      {/* 8. Слайдер */}
      <ProductSlider 
        title={<>Выбор <span className="italic text-accent">профессионалов</span></>} 
        subtitle="Лучшие коллекции" 
        products={products} 
      />
    </div>
  )
}
