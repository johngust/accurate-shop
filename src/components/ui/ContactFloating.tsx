"use client"

import { MessageCircle, Phone } from 'lucide-react'

export default function ContactFloating() {
  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col gap-4">
      <a 
        href="https://wa.me/yournumber" 
        target="_blank"
        className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-emerald-600 transition-all group"
      >
        <MessageCircle size={28} />
        <span className="absolute right-20 bg-white text-primary text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border border-gray-100 pointer-events-none">
          WhatsApp
        </span>
      </a>
      <button className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all group border border-white/10">
        <Phone size={24} />
        <span className="absolute right-20 bg-white text-primary text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border border-gray-100 pointer-events-none whitespace-nowrap">
          Заказать звонок
        </span>
      </button>
    </div>
  )
}
