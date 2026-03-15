'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  variantId: string
  name: string
  slug: string
  price: number
  quantity: number
  image: string
  isBulky: boolean
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
  hasBulkyItems: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Загрузка из localStorage при инициализации
  useEffect(() => {
    const savedCart = localStorage.getItem('aquaspace-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Ошибка загрузки корзины', e)
      }
    }
  }, [])

  // Сохранение в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('aquaspace-cart', JSON.stringify(items))
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems(current => {
      const existing = current.find(item => item.variantId === newItem.variantId)
      if (existing) {
        return current.map(item => 
          item.variantId === newItem.variantId 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }
      return [...current, newItem]
    })
  }

  const removeItem = (variantId: string) => {
    setItems(current => current.filter(item => item.variantId !== variantId))
  }

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId)
      return
    }
    setItems(current => 
      current.map(item => 
        item.variantId === variantId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => setItems([])

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const hasBulkyItems = items.some(item => item.isBulky)

  return (
    <CartContext.Provider value={{ 
      items, 
      addItem, 
      removeItem, 
      updateQuantity, 
      clearCart, 
      totalAmount, 
      hasBulkyItems 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
