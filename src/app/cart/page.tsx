'use client'

import { useCart } from '@/context/CartContext'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react'

export const runtime = "edge";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount } = useCart()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-40 text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-surface rounded-full mb-8">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h1 className="font-serif text-4xl text-primary mb-4 uppercase tracking-tight">Ваша корзина пуста</h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto font-light">
          Похоже, вы еще ничего не выбрали. Исследуйте наш каталог, чтобы найти идеальные решения для вашей ванной.
        </p>
        <Link href="/catalog/faucets" className="btn-primary inline-flex items-center gap-2 px-10 py-4 uppercase tracking-widest text-[10px] font-bold">
          Перейти в каталог <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen py-20">
      <div className="container mx-auto px-6">
        <h1 className="font-serif text-5xl text-primary mb-12 uppercase tracking-tight">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Список товаров */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.variantId} className="bg-white p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                <div className="relative w-32 aspect-[4/5] rounded-xl overflow-hidden bg-surface shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-grow text-center sm:text-left">
                  <Link href={`/product/${item.slug}`} className="font-serif text-xl text-primary hover:text-accent transition-colors block mb-2 leading-tight">
                    {item.name}
                  </Link>
                  <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                    {item.isBulky && (
                      <span className="text-[8px] uppercase tracking-widest bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10 font-bold">
                        Крупногабарит
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-4">
                  <div className="flex items-center border border-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="p-2 hover:text-accent transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="p-2 hover:text-accent transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-primary">{(item.price * item.quantity).toLocaleString('ru-RU')} тг.</p>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-[10px] text-red-400 uppercase tracking-widest font-bold flex items-center gap-1 mt-2 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Итого */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-32">
              <h3 className="font-serif text-2xl text-primary mb-8 border-b border-gray-50 pb-4">Итог заказа</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Товары ({items.length})</span>
                  <span className="text-primary font-medium">{totalAmount.toLocaleString('ru-RU')} тг.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Доставка</span>
                  <span className="text-accent font-medium uppercase tracking-widest text-[10px]">Рассчитывается далее</span>
                </div>
              </div>
              <div className="border-t border-primary/10 pt-6 mb-8">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-serif text-primary">К оплате</span>
                  <span className="text-3xl font-medium text-primary">{totalAmount.toLocaleString('ru-RU')} тг.</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full h-16 bg-primary text-white flex items-center justify-center rounded-2xl font-bold text-[11px] uppercase tracking-[0.25em] hover:bg-accent transition-all hover:shadow-2xl hover:shadow-accent/20 active:scale-[0.98]"
              >
                Оформить заказ
              </Link>
              <p className="text-[9px] text-gray-400 mt-6 text-center leading-relaxed uppercase tracking-widest">
                Нажимая кнопку, вы соглашаетесь с условиями публичной оферты
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
