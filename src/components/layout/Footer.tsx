import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/10 pb-12">
        {/* Brand */}
        <div>
          <Link href="/" className="group flex items-center gap-3 mb-6">
            <Image 
              src="/logo.svg" 
              alt="Accurate.kz Logo" 
              width={120} 
              height={32} 
              className="object-contain"
            />
          </Link>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Ваш надежный партнер в мире премиальной сантехники.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="p-2 border border-white/10 rounded-full hover:bg-white/10 transition-all">
              <Instagram className="w-4 h-4 text-accent" />
            </Link>
            <Link href="#" className="p-2 border border-white/10 rounded-full hover:bg-white/10 transition-all">
              <Facebook className="w-4 h-4 text-accent" />
            </Link>
            <Link href="#" className="p-2 border border-white/10 rounded-full hover:bg-white/10 transition-all">
              <Youtube className="w-4 h-4 text-accent" />
            </Link>
          </div>
        </div>

        {/* Catalog */}
        <div>
          <h4 className="font-serif text-xl mb-6 text-accent uppercase tracking-widest text-[11px] font-bold">Каталог</h4>
          <ul className="space-y-4 text-sm text-white/60 uppercase tracking-widest text-[10px]">
            <li><Link href="/catalog/faucets" className="hover:text-white transition-colors">Смесители</Link></li>
            <li><Link href="/catalog/baths" className="hover:text-white transition-colors">Ванны</Link></li>
            <li><Link href="/catalog/sinks" className="hover:text-white transition-colors">Раковины</Link></li>
            <li><Link href="/catalog/showers" className="hover:text-white transition-colors">Душевые кабины</Link></li>
            <li><Link href="/catalog/toilets" className="hover:text-white transition-colors">Унитазы</Link></li>
          </ul>
        </div>

        {/* Service */}
        <div>
          <h4 className="font-serif text-xl mb-6 text-accent uppercase tracking-widest text-[11px] font-bold">Сервис</h4>
          <ul className="space-y-4 text-sm text-white/60 uppercase tracking-widest text-[10px]">
            <li><Link href="/delivery" className="hover:text-white transition-colors">Доставка и подъем</Link></li>
            <li><Link href="/installation" className="hover:text-white transition-colors">Профессиональный монтаж</Link></li>
            <li><Link href="/guarantee" className="hover:text-white transition-colors">Гарантия и возврат</Link></li>
            <li><Link href="/b2b" className="hover:text-white transition-colors">B2B Программа</Link></li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="font-serif text-xl mb-6 text-accent uppercase tracking-widest text-[11px] font-bold">Контакты</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-accent shrink-0" />
              <span className="text-[11px] uppercase tracking-widest">г. Алматы</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-accent shrink-0" />
              <span className="text-[11px] uppercase tracking-widest font-bold">+7 (727) 000-00-00</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-accent shrink-0" />
              <span className="text-[11px] uppercase tracking-widest">info@accurate.kz</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest font-bold">
        <span>© {currentYear} ACCURATE.KZ.</span>
        <div className="flex gap-8">
          <Link href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Оферта</Link>
        </div>
      </div>
    </footer>
  )
}
