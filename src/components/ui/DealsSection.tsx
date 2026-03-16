'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Timer, Zap, ArrowRight, ShoppingCart } from 'lucide-react';

interface Deal {
  id: string;
  discount: number;
  product: {
    id: string;
    name: string;
    slug: string;
    brand: { name: string };
    media: { url: string }[];
    variants: { price: number }[];
  };
}

export default function DealsSection({ deals }: { deals: Deal[] }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeLeft({
        hours: 23 - now.getHours(),
        minutes: 59 - now.getMinutes(),
        seconds: 59 - now.getSeconds(),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!deals || deals.length === 0) return null;

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6 max-w-[1920px]">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform">
              <Zap className="text-accent w-8 h-8 fill-accent" />
            </div>
            <div>
              <h2 className="font-serif text-4xl text-primary leading-tight uppercase tracking-tight">
                Товары <span className="italic text-accent">дня</span>
              </h2>
              <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mt-1">Эксклюзивные предложения на 24 часа</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-4 bg-surface px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
            <Timer size={20} className="text-accent animate-pulse" />
            <div className="flex items-center gap-3">
              {[
                { label: 'ч', value: timeLeft.hours },
                { label: 'м', value: timeLeft.minutes },
                { label: 'с', value: timeLeft.seconds }
              ].map((t, i) => (
                <div key={i} className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary tabular-nums w-8 text-center">{String(t.value).padStart(2, '0')}</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t.label}</span>
                  {i < 2 && <span className="text-accent font-black">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {deals.slice(0, 2).map((deal) => {
            const oldPrice = deal.product.variants[0]?.price || 0;
            const newPrice = Math.round(oldPrice * (1 - deal.discount / 100));
            
            return (
              <div key={deal.id} className="group relative bg-surface rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-gray-50 transition-all duration-700 hover:shadow-premium hover:bg-white">
                {/* Discount Badge - Smaller */}
                <div className="absolute top-6 right-6 z-10 w-16 h-16 bg-accent rounded-full flex flex-col items-center justify-center text-white shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <span className="text-[8px] font-black uppercase tracking-tighter">Скидка</span>
                  <span className="text-xl font-black">-{deal.discount}%</span>
                </div>

                {/* Image - Smaller aspect */}
                <div className="w-full md:w-5/12 aspect-square relative">
                  <Image 
                    src={deal.product.media[0]?.url || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600'} 
                    alt={deal.product.name}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Content - Compact */}
                <div className="w-full md:w-7/12 space-y-4 text-center md:text-left">
                  <div className="space-y-1">
                    <span className="text-accent text-[9px] font-black uppercase tracking-[0.3em]">{deal.product.brand.name}</span>
                    <h3 className="font-serif text-xl text-primary leading-tight uppercase line-clamp-2">{deal.product.name}</h3>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-gray-400 text-xs line-through font-medium">{oldPrice.toLocaleString()} ₸</span>
                    <div className="flex items-baseline gap-2 justify-center md:justify-start">
                      <span className="text-3xl font-black text-primary tracking-tighter">{newPrice.toLocaleString()}</span>
                      <span className="text-lg font-serif italic text-accent">₸</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button className="bg-primary text-white px-6 h-12 rounded-xl flex items-center justify-center gap-2 hover:bg-accent transition-all duration-500 shadow-lg active:scale-95">
                      <ShoppingCart size={16} />
                      <span className="text-[9px] uppercase font-black tracking-widest">В корзину</span>
                    </button>
                    <Link 
                      href={`/product/${deal.product.slug}`}
                      className="flex items-center justify-center gap-2 text-[9px] uppercase font-black tracking-widest text-gray-400 hover:text-primary transition-colors"
                    >
                      Подробнее <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
