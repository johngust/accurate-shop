import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const runtime = "edge";

const COLLECTIONS = [
  {
    id: 'subway-2-0',
    name: 'Subway 2.0',
    brand: 'Villeroy & Boch',
    style: 'Minimalism',
    description: 'Мировой стандарт чистоты линий и функциональности.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800',
  },
  {
    id: 'escale',
    name: 'Escale',
    brand: 'Jacob Delafon',
    style: 'Geometric',
    description: 'Архитектурная эстетика, вдохновленная современным искусством.',
    image: 'https://images.unsplash.com/photo-1620626011761-9963d7521476?q=80&w=800',
  },
  {
    id: 'the-gap',
    name: 'The Gap',
    brand: 'Roca',
    style: 'Modern',
    description: 'Эргономичные решения для современных городских пространств.',
    image: 'https://images.unsplash.com/photo-1600566752355-3979ff1040ad?q=80&w=800',
  },
  {
    id: 'kartell-by-laufen',
    name: 'Kartell by Laufen',
    brand: 'Laufen',
    style: 'Avant-garde',
    description: 'Революционный союз швейцарской точности и итальянского стиля.',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800',
  },
  {
    id: 'bau-ceramic',
    name: 'Bau Ceramic',
    brand: 'Grohe',
    style: 'Classic',
    description: 'Мягкие формы для создания атмосферы абсолютного баланса.',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=800',
  }
]

export default function CollectionsPage() {
  return (
    <div className="bg-white min-h-screen font-sans animate-page-in">
      {/* Hero Section - Чистый архитектурный стиль, фон чуть плотнее */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 bg-[#F0EEEA]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-gray-200 pb-16">
            <div className="max-w-3xl">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-6 block">
                Accurate — Curated Series
              </span>
              <h1 className="text-7xl md:text-[10rem] leading-[0.85] font-serif text-primary tracking-tighter uppercase mb-0">
                Наши <br />
                <span className="italic font-light text-accent ml-0 md:ml-32">Коллекции</span>
              </h1>
            </div>
            <div className="max-w-[300px] pb-4">
              <p className="text-gray-400 text-[12px] uppercase tracking-widest leading-relaxed">
                Исследуйте гармонию формы и материала в нашей подборке лучших интерьерных серий мира.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section - 3 колонки, чистый вид, больше "воздуха" */}
      <section className="py-24 md:py-40 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {COLLECTIONS.map((collection) => (
            <div key={collection.id} className="group flex flex-col">
              {/* Image with subtle hover scale */}
              <Link 
                href={`/collections/${collection.id}`} 
                className="relative aspect-[3/4] overflow-hidden bg-surface mb-8 block"
              >
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
              </Link>

              {/* Minimal Text Info */}
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-4">
                  <span className="text-[10px] uppercase tracking-widest text-accent font-bold">
                    {collection.brand}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-gray-300">
                    {collection.style}
                  </span>
                </div>
                
                <h3 className="text-2xl text-primary font-serif mb-3 group-hover:translate-x-2 transition-transform duration-500 flex items-center gap-3">
                  {collection.name} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                
                <p className="text-gray-500 text-[13px] leading-relaxed font-light max-w-[280px]">
                  {collection.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modern Split CTA */}
      <section className="border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-primary p-16 md:p-32 flex flex-col justify-center">
            <h2 className="text-4xl md:text-6xl text-white font-serif italic mb-8">
              Нужна <span className="text-accent underline underline-offset-8 decoration-1">консультация?</span>
            </h2>
            <p className="text-white/50 text-sm uppercase tracking-widest mb-12 max-w-sm">
              Мы поможем подобрать идеальную коллекцию под ваш бюджет и технические требования.
            </p>
            <Link href="/contacts" className="inline-flex items-center gap-4 text-white text-[11px] uppercase tracking-[0.3em] font-bold group">
              Связаться с нами <div className="w-12 h-[1px] bg-accent group-hover:w-20 transition-all"></div>
            </Link>
          </div>
          <div className="relative min-h-[400px]">
            <Image 
              src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200" 
              alt="Design consultation"
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
