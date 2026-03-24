import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

const categories = [
  {
    name: 'Ванны',
    slug: 'baths',
    image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600',
    count: '1.2k+ товаров'
  },
  {
    name: 'Смесители',
    slug: 'faucets',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600',
    count: '3.5k+ товаров'
  },
  {
    name: 'Раковины',
    slug: 'sinks',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=600',
    count: '2.8k+ товаров'
  },
  {
    name: 'Унитазы',
    slug: 'toilets',
    image: 'https://images.unsplash.com/photo-1585659722982-7896187902d7?q=80&w=600',
    count: '1.5k+ товаров'
  },
  {
    name: 'Душевые',
    slug: 'showers',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=600',
    count: '900+ товаров'
  },
  {
    name: 'Мебель',
    slug: 'furniture',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600',
    count: '2.1k+ товаров'
  },
  {
    name: 'Аксессуары',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=600',
    count: '5k+ товаров'
  },
  {
    name: 'Освещение',
    slug: 'lighting',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600',
    count: '1.1k+ товаров'
  }
]

export default function CategoryGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-xs uppercase tracking-widest font-bold text-accent mb-4">Направления стиля</h2>
            <h3 className="font-serif text-5xl text-primary leading-tight uppercase tracking-tight">Исследуйте <span className="italic">категории</span></h3>
          </div>
          <Link href="/catalog" className="group flex items-center gap-3 text-xs uppercase tracking-widest font-bold border-b border-gray-100 pb-2 hover:border-accent transition-all">
            Смотреть весь каталог <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <Link 
              key={cat.slug}
              href={`/catalog/${cat.slug}`}
              className="group relative overflow-hidden rounded-3xl aspect-[4/5] bg-surface"
            >
              <Image 
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
              
              <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="text-accent text-[10px] uppercase tracking-widest font-bold mb-2 block opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                  {cat.count}
                </span>
                <h4 className="font-serif text-2xl text-white mb-4 uppercase tracking-tight">{cat.name}</h4>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
