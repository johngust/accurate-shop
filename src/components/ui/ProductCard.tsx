'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, Zap, ArrowRight, Info, ShieldCheck, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    brand: { name: string };
    category: { name: string };
    media: { url: string }[];
    variants: { price: number; stock: number; sku: string; options: string }[];
    isBulky: boolean;
    attributes?: string;
    description?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (showQuickView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showQuickView]);

  const mainImage = product.media[0]?.url || 'https://via.placeholder.com/1000';
  const price = product.variants[0]?.price || 0;
  const stock = product.variants[0]?.stock || 0;

  // Извлекаем размеры из вариантов
  const sizes = product.variants
    .map(v => {
      try {
        const opts = JSON.parse(v.options || '{}');
        return opts.size || null;
      } catch { return null; }
    })
    .filter(Boolean);

  // Парсинг динамических характеристик
  let dynamicSpecs: { label: string, value: string }[] = [];
  try {
    const parsed = JSON.parse(product.attributes || '{}');
    dynamicSpecs = Object.entries(parsed).map(([key, value]) => ({
      label: key,
      value: String(value)
    }));
  } catch (e) {
    console.error('Error parsing attributes');
  }

  const specs = dynamicSpecs.length > 0 ? dynamicSpecs : [
    { label: 'Бренд', value: product.brand.name },
    { label: 'Артикул', value: product.variants[0]?.sku },
    { label: 'Категория', value: product.category.name },
  ];

  const description = product.description || `${product.name} от бренда ${product.brand.name} — это стандарт надежности в сегменте торговой сантехники.`;

  const modalContent = (
    <div className="fixed inset-0 w-full h-full z-[99999] flex items-center justify-center p-4 md:p-10 pointer-events-auto">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-primary/80 backdrop-blur-2xl cursor-pointer" 
        onClick={() => setShowQuickView(false)}
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white w-full max-w-6xl rounded-[40px] shadow-premium flex flex-col md:flex-row overflow-hidden max-h-[90vh] z-10"
      >
        <button 
          onClick={() => setShowQuickView(false)}
          className="absolute top-8 right-8 z-50 w-10 h-10 flex items-center justify-center text-primary/20 hover:text-primary hover:rotate-90 transition-all duration-500 bg-surface rounded-full shadow-sm"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row w-full overflow-y-auto custom-scrollbar">
          {/* Left: Product View */}
          <div className="w-full md:w-5/12 bg-surface p-12 md:p-20 flex flex-col items-center justify-center border-r border-gray-50/50">
            <div className="relative w-full aspect-square mb-12">
              {isImageLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse rounded-3xl"></div>
              )}
              <Image 
                src={mainImage} 
                alt={product.name} 
                fill 
                className={`object-contain mix-blend-multiply transition-all duration-700 ${isImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                sizes="40vw"
                priority
                onLoadingComplete={() => setIsImageLoading(false)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-8 w-full border-t border-gray-100 pt-12">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-accent w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Гарантия</span>
                  <span className="text-[11px] font-bold text-primary uppercase">Официальная</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="text-accent w-5 h-5" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-black tracking-widest text-gray-400">Доставка</span>
                  <span className="text-[11px] font-bold text-primary uppercase">Весь Казахстан</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-7/12 p-10 md:p-16 bg-white space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full">
                  {product.brand.name}
                </span>
                <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  {stock > 0 ? 'В наличии' : 'Под заказ'}
                </div>
              </div>
              <h2 className="font-serif text-4xl text-primary leading-tight uppercase tracking-tight">
                {product.name}
              </h2>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-black text-primary tracking-tighter">
                  {price.toLocaleString()}
                </span>
                <span className="text-2xl font-serif italic text-accent">₸</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h4 className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.2em] text-accent">
                <Info size={14} /> Описание
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                {description}
              </p>
            </div>

            {/* Specs Grid */}
            <div className="space-y-6">
              <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-accent">Характеристики</h4>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {specs.map((spec, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-gray-50 pb-2 group cursor-default">
                    <span className="text-[10px] text-gray-400 uppercase font-medium tracking-wider">{spec.label}</span>
                    <span className="text-[11px] text-primary font-bold text-right group-hover:text-accent transition-colors">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-white h-16 rounded-2xl flex items-center justify-center gap-3 hover:bg-accent transition-all duration-500 shadow-xl shadow-primary/10"
              >
                <ShoppingCart size={20} strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black">В корзину</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-white border-2 border-primary text-primary h-16 rounded-2xl flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all duration-500"
              >
                <Zap size={20} className="fill-current" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-black">Купить в 2 клика</span>
              </motion.button>
            </div>

            <Link 
              href={`/product/${product.slug}`} 
              onClick={() => setShowQuickView(false)}
              className="group flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.4em] font-black text-gray-300 hover:text-accent transition-all mt-8"
            >
              Полная карточка товара
              <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <motion.div 
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="group relative bg-white rounded-3xl border border-gray-100 transition-all duration-700 hover:shadow-[0_20px_80px_-15px_rgba(0,0,0,0.1)] cursor-pointer hover:z-20 overflow-hidden"
        onClick={() => setShowQuickView(true)}
      >
        {/* Badge */}
        {product.isBulky && (
          <div className="absolute top-4 left-4 z-40 bg-primary/90 backdrop-blur-md text-white text-[8px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full ring-1 ring-white/20 transition-opacity group-hover:opacity-0">
            Крупногабарит
          </div>
        )}

        {/* Image Container */}
        <div className="aspect-[4/5] relative bg-surface rounded-t-3xl flex items-center justify-center p-8 pointer-events-none overflow-hidden">
          {isImageLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse"></div>
          )}
          <div className="relative w-full h-full transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2 z-30">
            <Image 
              src={mainImage}
              alt={product.name}
              fill
              className={`object-contain transition-all duration-700 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoadingComplete={() => setIsImageLoading(false)}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        </div>

        {/* Content Area */}
        <div className="p-4 md:p-6 space-y-1 md:space-y-2 relative z-10 bg-white rounded-b-3xl">
          <div className="flex justify-between items-start">
            <span className="text-[8px] md:text-[10px] text-accent font-bold uppercase tracking-widest line-clamp-1">{product.brand.name}</span>
            <span className="hidden md:block text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{product.category.name}</span>
          </div>
          <h3 className="font-serif text-sm md:text-lg text-primary leading-tight line-clamp-2 h-[2.5rem] md:h-[4.5rem] group-hover:text-accent transition-colors duration-500">
            {product.name}
          </h3>
          
          <div className="pt-1 md:pt-2 flex items-center justify-between">
            <span className="text-base md:text-xl font-bold text-primary tracking-tighter">{price.toLocaleString()} ₸</span>
            
            {/* Size Dots */}
            {sizes.length > 1 && (
              <div className="hidden md:flex gap-1">
                {sizes.slice(0, 3).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200 border border-gray-300"></div>
                ))}
                {sizes.length > 3 && <span className="text-[8px] text-gray-400 font-bold">+{sizes.length - 3}</span>}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showQuickView && mounted && createPortal(modalContent, document.body)}
      </AnimatePresence>
    </>
  );
}
