'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, FileText, Truck, ShieldCheck, Heart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface ProductClientProps {
  product: {
    id: string
    name: string
    slug: string
    brand: { name: string }
    media: { url: string; isPrimary: boolean }[]
    variants: { id: string; sku: string; price: any; stock: number; options: string }[]
    isBulky: boolean
  }
}

export default function ProductClient({ product }: ProductClientProps) {
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [activeImage, setActiveImage] = useState(
    product.media.find(m => m.isPrimary)?.url || product.media[0]?.url || 'https://via.placeholder.com/800'
  )

  const price = Number(selectedVariant?.price).toLocaleString('ru-RU')

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      price: Number(selectedVariant.price),
      quantity: 1,
      image: activeImage,
      isBulky: product.isBulky
    })
    alert('Товар добавлен в корзину')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
      {/* Левая колонка: Галерея (60% / 3 колонки) */}
      <div className="lg:col-span-3 flex flex-col md:flex-row gap-6">
        {/* Миниатюры */}
        <div className="flex md:flex-col gap-4 order-2 md:order-1 shrink-0 overflow-x-auto md:overflow-y-auto max-h-[600px] no-scrollbar">
          {product.media.map((m, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(m.url)}
              className={`relative w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all ${activeImage === m.url ? 'border-accent shadow-lg' : 'border-transparent hover:border-gray-200'
                }`}
            >
              <Image src={m.url} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>

        {/* Главное фото */}
        <div className="relative flex-grow aspect-[4/5] rounded-3xl overflow-hidden bg-surface order-1 md:order-2">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {product.isBulky && (
            <div className="absolute top-8 left-8 bg-primary/90 text-white text-[10px] uppercase tracking-widest px-6 py-2 rounded-full backdrop-blur-md font-bold shadow-xl border border-white/20">
              Крупногабарит
            </div>
          )}
          <button className="absolute top-8 right-8 p-3 bg-white/50 backdrop-blur-md rounded-full text-primary hover:text-accent transition-all hover:scale-110 shadow-sm border border-white/30">
            <Heart className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Правая колонка: Инфо и Кнопки (40% / 2 колонки) */}
      <div className="lg:col-span-2 flex flex-col justify-center">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] text-accent uppercase tracking-[0.3em] font-bold border-b border-accent pb-1">
              {product.brand.name}
            </span>
          </div>
          <h1 className="font-serif text-5xl text-primary leading-tight mb-6 uppercase tracking-tight">
            {product.name}
          </h1>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-medium text-primary tracking-tight">
              {price} <span className="text-xl font-normal text-gray-400">тг.</span>
            </span>
            {selectedVariant.stock > 0 ? (
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> В наличии
              </span>
            ) : (
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center gap-1">
                Под заказ
              </span>
            )}
          </div>
        </div>

        {/* Вариации */}
        {product.variants.length > 1 && (
          <div className="mb-12">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-6">Выберите исполнение</h4>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-6 py-3 border-2 rounded-xl text-xs font-medium transition-all ${selectedVariant.id === v.id
                      ? 'border-primary bg-primary text-white shadow-xl'
                      : 'border-gray-100 hover:border-accent text-primary'
                    }`}
                >
                  {JSON.parse(v.options).finish || JSON.parse(v.options).size || v.sku}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки действия */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleAddToCart}
            className="group relative w-full h-16 bg-primary text-white overflow-hidden rounded-2xl transition-all hover:shadow-2xl hover:shadow-primary/20 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <div className="relative flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-[0.25em]">
              <ShoppingCart className="w-5 h-5" />
              Добавить в корзину
            </div>
          </button>

          <button className="flex items-center justify-center gap-3 w-full h-16 border-2 border-primary/10 text-primary font-bold text-[11px] uppercase tracking-[0.25em] rounded-2xl hover:border-accent hover:text-accent transition-all active:scale-[0.98]">
            <FileText className="w-5 h-5" />
            Добавить в смету (B2B)
          </button>
        </div>

        {/* Сервисные блоки */}
        <div className="mt-12 grid grid-cols-2 gap-6 pt-12 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-accent shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Доставка</p>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest">Завтра от 990 тг.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Гарантия</p>
              <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest">5 лет от бренда</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
