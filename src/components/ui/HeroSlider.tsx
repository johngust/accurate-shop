'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  tagline: string
  image: string
  buttonText: string
  link: string
}

const DEFAULT_PROMOS = [
  {
    id: '1',
    title: "Ваша идеальная",
    subtitle: "ванная комната",
    tagline: "Accurate Selection & Luxury Engineering",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2000",
    buttonText: "Смотреть каталог",
    link: "/catalog"
  },
  {
    id: '2',
    title: "Весеннее",
    subtitle: "обновление -20%",
    tagline: "Скидки на коллекцию сантехники Villeroy & Boch",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000",
    buttonText: "Успеть купить",
    link: "/catalog/villeroy-boch"
  }
]

export default function HeroSlider({ slides }: { slides?: HeroSlide[] }) {
  const promos = slides && slides.length > 0 ? slides : DEFAULT_PROMOS
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (promos.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [promos.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % promos.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? promos.length - 1 : prev - 1))

  if (promos.length === 0) return null

  return (
    <section className="relative h-[70vh] flex items-center overflow-hidden bg-zinc-900 group">
      {promos.map((promo, index) => (
        <div 
          key={promo.id || index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
        >
          <div className="absolute inset-0 z-0">
            <Image 
              src={promo.image} 
              alt={promo.title}
              fill
              className="object-cover opacity-50 grayscale"
              style={{ objectPosition: '50% 70%' }}
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/40 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 h-full flex items-center relative z-10">
            <div className="max-w-4xl">
              <span className={`inline-block text-accent uppercase tracking-luxury text-[10px] font-bold mb-4 transition-all duration-700 delay-300 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {promo.tagline}
              </span>
              <h1 className={`font-serif text-4xl md:text-6xl text-white mb-6 leading-tight uppercase tracking-tight transition-all duration-700 delay-500 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {promo.title} <br />
                <span className="italic text-accent text-5xl md:text-7xl">{promo.subtitle}</span>
              </h1>
              <div className={`flex flex-col sm:flex-row gap-4 mt-8 transition-all duration-700 delay-700 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <Link href={promo.link} className="btn-accent h-14 flex items-center justify-center px-10 text-[10px] uppercase tracking-[0.3em] font-bold">
                  {promo.buttonText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {promos.length > 1 && (
        <>
          {/* Slider Controls */}
          <button 
            onClick={prevSlide} 
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all hidden md:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide} 
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all hidden md:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Progress Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {promos.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className="group py-2"
              >
                <div className={`h-0.5 transition-all duration-500 ${index === currentSlide ? 'w-12 bg-accent' : 'w-6 bg-white/20 hover:bg-white/40'}`}></div>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
