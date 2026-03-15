import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

export default async function AllCategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: true,
      _count: {
        select: { products: true }
      }
    }
  })

  return (
    <div className="bg-surface min-h-screen py-20">
      <div className="container mx-auto px-6">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 mb-12">
          <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary font-medium">Каталог</span>
        </div>

        <h1 className="font-serif text-6xl text-primary mb-16 uppercase tracking-tight">Полный <span className="italic text-accent">каталог</span></h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {categories.map((cat) => (
            <div key={cat.id} className="group">
              <Link href={`/catalog/${cat.slug}`} className="block relative aspect-[16/9] rounded-3xl overflow-hidden mb-6 bg-white border border-gray-100 shadow-sm group-hover:shadow-xl transition-all">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                   {/* Placeholder for category icon/image */}
                   <h2 className="font-serif text-3xl text-primary uppercase text-center group-hover:text-accent transition-colors">{cat.name}</h2>
                </div>
                <div className="absolute bottom-6 right-8">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{cat._count.products} товаров</span>
                </div>
              </Link>
              
              <ul className="space-y-4 pl-4 border-l border-gray-100">
                {cat.children.map((sub) => (
                  <li key={sub.id}>
                    <Link 
                      href={`/catalog/${sub.slug}`}
                      className="text-[11px] uppercase tracking-[0.2em] text-gray-500 hover:text-accent transition-colors flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                      {sub.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href={`/catalog/${cat.slug}`} className="text-[10px] text-accent font-bold uppercase tracking-widest hover:underline">
                    Смотреть все в {cat.name}
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
