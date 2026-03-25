'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Truck, CreditCard, CheckCircle2, Box } from 'lucide-react'

export const runtime = "edge";

export default function CheckoutPage() {
  const { items, totalAmount, hasBulkyItems, clearCart } = useCart()
  const [isOrdered, setIsOrdered] = useState(false)

  // Состояние формы
  const [logistics, setLogistics] = useState({
    requiresLift: false,
    hasElevator: true,
    requiresAssembly: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Здесь будет логика отправки заказа в БД
    setIsOrdered(true)
    clearCart()
  }

  if (isOrdered) {
    return (
      <div className="container mx-auto px-6 py-40 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-8" />
        <h1 className="font-serif text-4xl text-primary mb-4 uppercase tracking-tight">Заказ успешно оформлен!</h1>
        <p className="text-gray-500 mb-10 max-w-md mx-auto font-light leading-relaxed">
          Спасибо за ваш выбор. Наш менеджер свяжется с вами в течение 15 минут для подтверждения деталей доставки и монтажа.
        </p>
        <Link href="/" className="btn-primary inline-flex px-12 py-4 uppercase tracking-widest text-[10px] font-bold">
          Вернуться на главную
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen py-20">
      <div className="container mx-auto px-6">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400 hover:text-primary mb-12 transition-colors font-bold">
          <ChevronLeft className="w-4 h-4" /> Назад в корзину
        </Link>

        <h1 className="font-serif text-5xl text-primary mb-16 uppercase tracking-tight">Оформление заказа</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            {/* Контактные данные */}
            <section>
              <h3 className="font-serif text-2xl text-primary mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-sans">1</span>
                Контактная информация
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="Имя" required className="bg-white border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm" />
                <input type="text" placeholder="Фамилия" required className="bg-white border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm" />
                <input type="email" placeholder="Email" required className="bg-white border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm" />
                <input type="tel" placeholder="Телефон" required className="bg-white border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm" />
              </div>
            </section>

            {/* Доставка */}
            <section>
              <h3 className="font-serif text-2xl text-primary mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-sans">2</span>
                Адрес доставки
              </h3>
              <div className="space-y-6">
                <input type="text" placeholder="Адрес (Улица, дом, квартира)" required className="w-full bg-white border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-accent outline-none shadow-sm" />

                {/* Умная логистика для Крупногабарита */}
                {hasBulkyItems && (
                  <div className="bg-accent/5 border border-accent/20 rounded-2xl p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Box className="w-6 h-6 text-accent" />
                      <div>
                        <h4 className="font-serif text-lg text-primary">Параметры доставки</h4>
                        <p className="text-[10px] text-accent uppercase tracking-widest font-bold">В корзине есть крупногабаритные товары</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-transparent cursor-pointer hover:border-accent/30 transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={logistics.requiresLift}
                          onChange={(e) => setLogistics({ ...logistics, requiresLift: e.target.checked })}
                          className="w-5 h-5 accent-accent"
                        />
                        <span className="text-sm text-gray-700 font-medium">Нужен подъем на этаж</span>
                      </label>

                      {logistics.requiresLift && (
                        <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-transparent cursor-pointer hover:border-accent/30 transition-all shadow-sm">
                          <input
                            type="checkbox"
                            checked={logistics.hasElevator}
                            onChange={(e) => setLogistics({ ...logistics, hasElevator: e.target.checked })}
                            className="w-5 h-5 accent-accent"
                          />
                          <span className="text-sm text-gray-700 font-medium">Есть грузовой лифт</span>
                        </label>
                      )}

                      <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-transparent cursor-pointer hover:border-accent/30 transition-all shadow-sm">
                        <input
                          type="checkbox"
                          checked={logistics.requiresAssembly}
                          onChange={(e) => setLogistics({ ...logistics, requiresAssembly: e.target.checked })}
                          className="w-5 h-5 accent-accent"
                        />
                        <span className="text-sm text-gray-700 font-medium">Нужен монтаж</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Оплата */}
            <section>
              <h3 className="font-serif text-2xl text-primary mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-sans">3</span>
                Способ оплаты
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-accent cursor-pointer shadow-sm">
                  <CreditCard className="w-6 h-6 text-accent" />
                  <div className="text-left">
                    <p className="font-medium text-primary">Картой онлайн</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">VISA, MasterCard, МИР</p>
                  </div>
                  <input type="radio" name="payment" defaultChecked className="ml-auto accent-accent" />
                </label>
                <label className="flex items-center gap-4 p-6 bg-white rounded-2xl border-2 border-transparent hover:border-accent/30 cursor-pointer shadow-sm transition-all">
                  <Truck className="w-6 h-6 text-gray-400" />
                  <div className="text-left">
                    <p className="font-medium text-primary">При получении</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Наличными или картой</p>
                  </div>
                  <input type="radio" name="payment" className="ml-auto accent-accent" />
                </label>
              </div>
            </section>
          </div>

          {/* Саммари заказа */}
          <div className="lg:col-span-1">
            <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 sticky top-32">
              <h3 className="font-serif text-2xl text-primary mb-8 border-b border-gray-50 pb-4">Ваш заказ</h3>
              <div className="space-y-4 mb-10 max-h-60 overflow-y-auto pr-4 no-scrollbar">
                {items.map(item => (
                  <div key={item.variantId} className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface shrink-0">
                        <Image src={item.image} alt="" fill className="object-cover" />
                      </div>
                      <span className="text-[11px] font-medium text-primary line-clamp-2 uppercase tracking-tighter leading-tight">
                        {item.name} <span className="text-gray-400">× {item.quantity}</span>
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">{(item.price * item.quantity).toLocaleString('ru-RU')} тг.</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-10 border-t border-gray-50 pt-8">
                <div className="flex justify-between text-xs uppercase tracking-widest text-gray-400">
                  <span>Товары</span>
                  <span className="text-primary font-bold">{totalAmount.toLocaleString('ru-RU')} тг.</span>
                </div>
                <div className="flex justify-between text-xs uppercase tracking-widest text-gray-400">
                  <span>Доставка</span>
                  <span className="text-accent font-bold">Бесплатно</span>
                </div>
                {logistics.requiresLift && (
                  <div className="flex justify-between text-xs uppercase tracking-widest text-gray-400">
                    <span>Подъем на этаж</span>
                    <span className="text-accent font-bold">от 2 000 тг.</span>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-primary/10 pt-8 mb-10">
                <div className="flex justify-between items-baseline">
                  <span className="text-xl font-serif text-primary uppercase">Итого</span>
                  <span className="text-3xl font-medium text-primary tracking-tighter">{totalAmount.toLocaleString('ru-RU')} тг.</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-20 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-accent transition-all hover:shadow-2xl hover:shadow-accent/20 active:scale-[0.98] shadow-xl shadow-primary/10"
              >
                Подтвердить заказ
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
