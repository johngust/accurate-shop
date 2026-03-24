'use client'

import { X, ChevronRight, ShoppingBag, Heart, Star, ShieldCheck, Clock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileMenuProps {
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
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ categories, isOpen, onClose }: MobileMenuProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] lg:hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-primary/60 backdrop-blur-md" 
            onClick={onClose}
          />
          
          {/* Menu Content */}
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-surface">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">AquaSpace</span>
                <span className="text-[12px] font-serif italic text-primary">Premium Showroom</span>
              </div>
              <motion.button 
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="p-2 text-primary"
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Navigation */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {/* Main Links */}
              <div className="p-4 grid grid-cols-2 gap-2 border-b border-gray-100">
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Link href="/wishlist" onClick={onClose} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl gap-2 h-full">
                        <Heart size={20} className="text-primary" />
                        <span className="text-[9px] uppercase font-black tracking-widest">Избранное</span>
                    </Link>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }}>
                    <Link href="/cart" onClick={onClose} className="flex flex-col items-center justify-center p-4 bg-primary text-white rounded-2xl gap-2 h-full shadow-lg shadow-primary/20">
                        <ShoppingBag size={20} />
                        <span className="text-[9px] uppercase font-black tracking-widest">Корзина</span>
                    </Link>
                </motion.div>
              </div>

              {/* Categories List */}
              <div className="p-6 space-y-8">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-400">Каталог продукции</h3>
                <nav className="space-y-4">
                  {categories.map((cat, idx) => (
                    <motion.div 
                      key={cat.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="border-b border-gray-50 pb-4"
                    >
                      <div 
                        className="flex items-center justify-between group cursor-pointer"
                        onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                      >
                        <span className="font-serif text-xl text-primary group-hover:text-accent transition-colors uppercase tracking-tight">
                          {cat.name}
                        </span>
                        <ChevronRight 
                          size={18} 
                          className={`text-accent transition-transform duration-300 ${expandedCat === cat.id ? 'rotate-90' : ''}`} 
                        />
                      </div>

                      <AnimatePresence>
                        {expandedCat === cat.id && cat.children.length > 0 && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pl-4 space-y-3 overflow-hidden"
                          >
                            {cat.children.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/catalog/${sub.slug}`}
                                onClick={onClose}
                                className="block text-[11px] uppercase tracking-widest text-gray-500 hover:text-accent font-bold"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </nav>
              </div>

              {/* Elite Services */}
              <div className="p-6 bg-surface mt-4 space-y-6">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-gray-400">Сервисы</h3>
                <div className="grid grid-cols-1 gap-4">
                  <motion.div whileHover={{ x: 5 }}>
                    <Link href="/b2b" onClick={onClose} className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-accent group-hover:bg-accent group-hover:text-white transition-all">
                        <Star size={18} />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-black tracking-widest">B2B Кабинет</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-tighter font-medium">Для дизайнеров и прорабов</span>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-100 bg-gray-50">
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="tel:+77777777777" 
                className="block w-full py-4 bg-white border border-gray-200 text-center rounded-2xl text-[11px] uppercase tracking-[0.3em] font-black hover:border-accent transition-colors"
              >
                Позвонить в шоурум
              </motion.a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
