import Link from 'next/link'
import Image from 'next/image'
import { Search, ShoppingBag, User, Heart, Menu } from 'lucide-react'
import MegaMenu from './MegaMenu'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export default async function Header() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: 'asc' }
  })
  
  console.log(`HEADER DEBUG: Найдено ${categories.length} корневых категорий.`);
  categories.forEach(c => console.log(` - ${c.name}: ${c.children.length} подкатегорий`));

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Upper bar */}
      <div className="bg-primary text-white py-1 px-6 text-[10px] uppercase tracking-widest flex justify-between items-center">
        <span>Бесплатная доставка крупногабарита от 150к ₸</span>
        <div className="flex gap-4 font-bold">
          <Link href="/b2b" className="hover:text-accent transition-colors">Для B2B</Link>
          <Link href="/contacts" className="hover:text-accent transition-colors">Контакты</Link>
        </div>
      </div>

      <div className="container mx-auto px-6 h-20 flex items-center justify-between relative">
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

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-surface border border-gray-200 rounded-full px-4 py-2 focus-within:border-accent/50 transition-all">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск сантехники..." 
              className="bg-transparent border-none outline-none text-sm px-2 w-48 focus:w-64 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-primary hover:text-accent transition-colors relative">
              <Heart className="w-5 h-5" />
            </button>
            <Link href="/account" className="p-2 text-primary hover:text-accent transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <Link href="/cart" className="p-2 text-primary hover:text-accent transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </Link>
            <button className="lg:hidden p-2 text-primary">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
