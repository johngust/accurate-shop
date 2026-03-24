import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin, CreditCard } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function Footer() {
  const currentYear = new Date().getFullYear()
  
  // Получаем топ-5 категорий для подвала
  const categories = await prisma.category.findMany({
    take: 5,
    where: { parentId: null },
    orderBy: { name: 'asc' }
  })

  return (
    <footer className="bg-primary text-white pt-24 pb-12 font-sans">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 border-b border-white/5 pb-20">
        {/* Brand & Mission */}
        <div className="space-y-8">
          <Link href="/" className="inline-block">
            <Image 
              src="/logo.svg" 
              alt="Accurate.kz Logo" 
              width={140} 
              height={36} 
              className="object-contain brightness-0 invert"
            />
          </Link>
          <p className="text-white/50 text-[11px] uppercase tracking-widest leading-loose">
            Первый интеллектуальный гипермаркет сантехники в Казахстане. Только HD-контент и проверенные бренды.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-accent transition-colors"><Instagram size={18} /></Link>
            <Link href="#" className="hover:text-accent transition-colors"><Facebook size={18} /></Link>
            <Link href="#" className="hover:text-accent transition-colors"><Youtube size={18} /></Link>
          </div>
        </div>

        {/* Dynamic Catalog */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-accent mb-10">Каталог</h4>
          <ul className="space-y-5 text-[11px] uppercase tracking-widest font-bold text-white/40">
            {categories.map(cat => (
              <li key={cat.id}>
                <Link href={`/catalog?category=${cat.id}`} className="hover:text-white transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
            <li><Link href="/catalog" className="text-accent hover:underline">Весь каталог</Link></li>
          </ul>
        </div>

        {/* Client Service */}
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-accent mb-10">Покупателям</h4>
          <ul className="space-y-5 text-[11px] uppercase tracking-widest font-bold text-white/40">
            <li><Link href="/delivery" className="hover:text-white transition-colors">Доставка и оплата</Link></li>
            <li><Link href="/guarantee" className="hover:text-white transition-colors">Гарантия и возврат</Link></li>
            <li><Link href="/b2b" className="hover:text-white transition-colors">Дизайнерам (B2B)</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">О компании</Link></li>
          </ul>
        </div>

        {/* Trust & Contacts */}
        <div className="space-y-10">
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-accent mb-6">Связь</h4>
            <div className="space-y-4">
              <a href="tel:+77270000000" className="block text-xl font-serif italic hover:text-accent transition-colors">+7 (727) 000-00-00</a>
              <p className="text-[10px] text-white/30 uppercase tracking-widest">Ежедневно: 09:00 — 21:00</p>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-accent mb-4">Принимаем к оплате</h4>
            <div className="flex gap-4 text-white/20">
              <CreditCard size={24} />
              <span className="text-[9px] uppercase tracking-tighter self-end font-black">Visa / Mastercard / Kaspi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">
        <span>© {currentYear} ACCURATE SANITARY SOLUTIONS. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-10">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
