'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface MegaMenuProps {
  categories: {
    id: string
    name: string
    slug: string
    children: {
      id: string
      name: string
      slug: string
    }[]
  }[]
}

export default function MegaMenu({ categories }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  if (!categories || categories.length === 0) {
    return (
      <Link href="/catalog" className="text-primary hover:text-accent transition-colors cursor-pointer font-bold uppercase tracking-widest text-[11px]">
        Каталог
      </Link>
    );
  }

  return (
    <div 
      className="group py-7 relative z-[100]"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link 
        href="/catalog" 
        onClick={closeMenu}
        className="flex items-center gap-1 text-primary hover:text-accent transition-colors cursor-pointer"
      >
        Каталог
      </Link>

      <div 
        className={`absolute top-full left-1/2 -translate-x-1/2 w-[95vw] max-w-7xl mt-6 bg-primary/95 backdrop-blur-xl shadow-premium ring-1 ring-white/10 rounded-[40px] transition-all duration-500 z-50 overflow-hidden border border-white/10 ${
          isOpen ? 'opacity-100 visible translate-y-2' : 'opacity-0 invisible translate-y-0'
        }`}
        onClick={closeMenu}
      >
        <div className="container mx-auto px-12 py-16 grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Categories */}
          <div className="md:col-span-3 grid grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-4">
                <Link 
                  href={`/catalog/${cat.slug}`}
                  className="text-white font-serif text-lg block hover:text-accent transition-all hover:translate-x-1 uppercase tracking-wider font-bold"
                >
                  {cat.name}
                </Link>
                <ul className="space-y-2 border-l border-white/5 pl-4">
                  {cat.children.map((sub) => (
                    <li key={sub.id}>
                      <Link 
                        href={`/catalog/${sub.slug}`}
                        className="text-[10px] uppercase tracking-[0.15em] text-zinc-400 hover:text-accent transition-all flex items-center gap-2 group/item"
                      >
                        <div className="w-1 h-1 rounded-full bg-white/10 group-hover/item:bg-accent transition-colors"></div>
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {/* General Link to full catalog */}
            <div className="col-span-full pt-8 border-t border-white/5">
              <Link href="/catalog" className="inline-flex items-center gap-3 text-white hover:text-accent transition-all group/all">
                <span className="text-[11px] uppercase tracking-[0.3em] font-black">Перейти в полный каталог продукции</span>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover/all:border-accent group-hover/all:translate-x-2 transition-all">
                  <ChevronRight size={14} />
                </div>
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="border-l pl-12 border-white/10 space-y-8">
            <h3 className="text-white font-serif text-xl uppercase tracking-tight">Сервис</h3>
            <ul className="space-y-6">
              <li>
                <Link href="/b2b" className="group flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent transition-colors text-white">
                    <span className="font-serif italic text-lg">B</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[11px] uppercase tracking-widest text-white group-hover:text-accent transition-colors">B2B Кабинет</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-tighter">Спецусловия для профи</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/projects" className="group flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent transition-colors text-white">
                    <span className="font-serif italic text-lg">P</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[11px] uppercase tracking-widest text-white group-hover:text-accent transition-colors">Мои Сметы</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-tighter">Управление проектами</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="group flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-accent transition-colors text-white">
                    <span className="font-serif italic text-lg">S</span>
                  </div>
                  <div>
                    <span className="block font-bold text-[11px] uppercase tracking-widest text-white group-hover:text-accent transition-colors">Доставка</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-tighter">По всему Казахстану</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Promo */}
          <div className="relative overflow-hidden rounded-[30px] bg-white/5 text-white p-10 flex flex-col justify-end min-h-[350px] group border border-white/10 self-start">
            <Image 
              src="https://images.unsplash.com/photo-1620627812624-38308872e690?q=80&w=600"
              alt="Promo"
              fill
              className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-600 via-zinc-600/20 to-transparent"></div>
            <div className="relative z-10">
              <span className="text-accent text-[9px] uppercase tracking-widest font-bold mb-2 block">New Arrival</span>
              <h4 className="font-serif text-xl mb-4 italic leading-tight">Коллекция Artis от Villeroy & Boch</h4>
              <Link href="/catalog/sinks" className="inline-block text-[10px] uppercase tracking-widest border-b border-accent pb-1 hover:text-accent transition-colors font-bold">
                Подробнее
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
