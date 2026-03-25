'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingBag, User, Heart, Menu } from 'lucide-react'
import MegaMenu from './MegaMenu'
import SearchInput from './SearchInput'
import dynamic from 'next/dynamic'

const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false })

interface HeaderClientProps {
  categories: any[]
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 pt-[env(safe-area-inset-top)] lg:pt-0">
        {/* Upper bar - Hidden on mobile, visible on lg+ */}
        <div className="hidden lg:flex bg-primary text-white py-1 px-6 text-[10px] uppercase tracking-widest justify-between items-center">
          <span>Бесплатная доставка крупногабарита от 150к ₸</span>
          <div className="flex gap-4 font-bold">
            <Link href="/b2b" className="hover:text-accent transition-colors">Для B2B</Link>
            <Link href="/contacts" className="hover:text-accent transition-colors">Контакты</Link>
          </div>
        </div>

        <div className="container mx-auto px-6 h-20 lg:h-20 flex items-center justify-between relative mt-2 lg:mt-0">
          {/* Logo */}
          <Link href="/" className="group flex flex-col items-start">
            <Image 
              src="/logo.svg" 
              alt="Accurate.kz Logo" 
              width={160} 
              height={40} 
              className="object-contain group-hover:scale-105 transition-transform brightness-0"
            />
            <span className="text-[11px] uppercase tracking-widest text-black font-extrabold mt-0.5 group-hover:text-accent transition-colors">
              Лучший магазин сантехники
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-10 font-bold uppercase tracking-widest text-[11px]">
            <MegaMenu categories={categories} />
            <Link href="/collections" className="text-primary hover:text-accent transition-colors">Коллекции</Link>
            <Link href="/projects" className="text-primary hover:text-accent transition-colors">Сметы</Link>
          </nav>

          {/* Search Input - Central */}
          <div className="hidden xl:block max-w-sm w-full">
            <SearchInput />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/wishlist" className="hidden sm:flex p-2 text-primary hover:text-accent transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <Link href="/account" className="hidden sm:flex p-2 text-primary hover:text-accent transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="p-2 text-primary hover:text-accent transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-primary hover:text-accent transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu 
        categories={categories} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}
