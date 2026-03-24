'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

interface ProductSliderProps {
  title: any
  subtitle: string
  products: any[]
}

export default function ProductSlider({ title, subtitle, products }: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="container mx-auto px-6 mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
        <div className="max-w-2xl">
          <h2 className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-accent mb-4">{subtitle}</h2>
          <h3 className="font-serif text-3xl md:text-5xl text-primary leading-tight uppercase tracking-tight">{title}</h3>
        </div>
        <div className="flex gap-4 md:static absolute bottom-8 right-6 z-10">
          <button 
            onClick={() => scroll('left')}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-100 bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-gray-100 bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div 
          ref={scrollRef}
          className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-12 snap-x snap-mandatory"
        >
          {products.map((product: any) => (
            <div key={product.id} className="min-w-[70%] sm:min-w-[45%] md:min-w-96 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
