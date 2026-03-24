import Link from 'next/link'
import Image from 'next/image'

const BRANDS = [
  { name: 'Cersanit', slug: 'cersanit' },
  { name: 'Haiba', slug: 'haiba' },
  { name: 'Bravat', slug: 'bravat' },
  { name: 'Belz', slug: 'belz' },
  { name: 'Grohe', slug: 'grohe' },
  { name: 'LeMark', slug: 'lemark' }
]

export default function BrandGrid() {
  return (
    <section className="relative py-32 overflow-hidden bg-black">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/brand-bg.png" 
          alt="Luxury Bathroom Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Верхняя кнопка */}
        <div className="flex justify-center mb-16">
          <Link 
            href="/catalog" 
            className="px-12 py-4 border-2 border-white text-white text-xl font-medium rounded-2xl hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-sm"
          >
            Посмотреть Каталог
          </Link>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl text-white font-light tracking-wide">
            Популярные бренды
          </h2>
        </div>

        {/* Сетка брендов (Glassmorphism) - 2 cols on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {BRANDS.map((brand) => (
            <Link 
              key={brand.slug} 
              href={`/catalog?brands=${brand.slug}`}
              className="group relative h-32 md:h-48 bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] md:rounded-[2.rem] flex items-center justify-center p-4 md:p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500"
            >
              <div className="text-center">
                <span className="text-xl md:text-4xl font-black tracking-tighter text-white uppercase opacity-80 group-hover:opacity-100 transition-opacity">
                  {brand.name}
                </span>
                <div className="hidden md:block">
                  {brand.name === 'Haiba' && <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest">Haiba Sanitary Wares</p>}
                  {brand.name === 'Bravat' && <p className="text-[10px] text-white/40 mt-2 uppercase tracking-widest">BY DIETSCHE 🇩🇪 1873</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
