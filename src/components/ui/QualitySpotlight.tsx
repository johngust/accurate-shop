import Image from 'next/image'
import { Check } from 'lucide-react'

export default function QualitySpotlight() {
  return (
    <section className="relative py-32 text-white overflow-hidden min-h-[800px] flex items-center group">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 transition-transform duration-[3s] group-hover:scale-110">
        <Image
          src="https://images.unsplash.com/photo-1620626011761-9963d7b5970c?q=80&w=2000"
          alt="Luxury Bathroom Background"
          fill
          className="object-cover"
          priority
        />
        {/* Elite Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-primary/40"></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 relative group/image">
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/30 rounded-full blur-[150px] animate-pulse"></div>
            <div className="relative z-10 border border-white/20 rounded-[40px] overflow-hidden shadow-premium transition-all duration-700 group-hover/image:scale-[1.02] group-hover/image:shadow-[0_0_80px_rgba(201,169,110,0.3)]">
              <Image
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000"
                alt="Detail Quality"
                width={1000}
                height={800}
                className="object-cover transition-transform duration-1000 group-hover/image:scale-110"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-accent p-10 rounded-[30px] shadow-premium hidden md:block transform transition-transform duration-500 hover:scale-110">
              <p className="text-primary font-serif italic text-5xl leading-none tracking-tighter">100%</p>
              <p className="text-primary/60 text-[11px] uppercase font-black tracking-[0.3em] mt-3">Original</p>
            </div>
          </div>

          <div className="lg:w-1/2 space-y-12">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-px bg-accent"></div>
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-accent font-black">Elite Standards</h2>
              </div>
              <h3 className="text-4xl md:text-7xl font-serif italic leading-[1.1] tracking-tight break-words">
                Бескомпромиссная <br className="hidden md:block"/> 
                <span className="text-accent">точность</span> в деталях
              </h3>
            </div>

            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
              Мы не просто продаем сантехнику. Мы оцифровываем каждую деталь, чтобы вы видели реальный продукт в HD-качестве. Каждая карточка товара проходит через наш ИИ-контроль соответствия стандартам.
            </p>
            
            <ul className="space-y-6">
              {[
                "HD Изображения с оригинальных заводов",
                "Технические характеристики проверены экспертами",
                "Прямые контракты с брендами Grohe, LeMark",
                "Собственная система контроля качества Accurate"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full border border-accent/30 flex items-center justify-center group-hover:bg-accent transition-colors">
                    <Check size={12} className="text-accent group-hover:text-primary" />
                  </div>
                  <span className="text-sm uppercase tracking-widest font-medium text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
