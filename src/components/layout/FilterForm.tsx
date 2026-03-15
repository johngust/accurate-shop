'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import PriceSlider from '../ui/PriceSlider'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface CategoryNode {
  id: string
  name: string
  slug: string
  children?: CategoryNode[]
}

interface FilterFormProps {
  brands: { id: string; name: string; slug: string }[]
  categories: CategoryNode[]
  currentCategorySlug?: string
}

const COLORS = [
  { name: 'Хром', value: 'chrome', bg: 'bg-slate-300' },
  { name: 'Золото', value: 'gold', bg: 'bg-yellow-500' },
  { name: 'Черный', value: 'black', bg: 'bg-black' },
  { name: 'Белый', value: 'white', bg: 'bg-white border' },
  { name: 'Бронза', value: 'bronze', bg: 'bg-amber-800' }
]

export default function FilterForm({ brands, categories, currentCategorySlug }: FilterFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',').filter(Boolean) || []
  )
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get('colors')?.split(',').filter(Boolean) || []
  )
  const [priceRange, setPriceRange] = useState({
    min: Number(searchParams.get('minPrice')) || 0,
    max: Number(searchParams.get('maxPrice')) || 1000000
  })
  const [selectedSort, setSelectedSort] = useState<string>(
    searchParams.get('sort') || 'popular'
  )
  const [expandedCats, setExpandedCats] = useState<string[]>([])

  useEffect(() => {
    setSelectedBrands(searchParams.get('brands')?.split(',').filter(Boolean) || [])
    setSelectedColors(searchParams.get('colors')?.split(',').filter(Boolean) || [])
    setSelectedSort(searchParams.get('sort') || 'popular')
    setPriceRange({
      min: Number(searchParams.get('minPrice')) || 0,
      max: Number(searchParams.get('maxPrice')) || 1000000
    })
  }, [searchParams])

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedCats(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBrandChange = (brandSlug: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandSlug) 
        ? prev.filter(b => b !== brandSlug) 
        : [...prev, brandSlug]
    )
  }

  const handleColorToggle = (colorValue: string) => {
    setSelectedColors(prev => 
      prev.includes(colorValue) 
        ? prev.filter(c => c !== colorValue) 
        : [...prev, colorValue]
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedBrands.length > 0) {
      params.set('brands', selectedBrands.join(','))
    } else {
      params.delete('brands')
    }

    if (selectedColors.length > 0) {
      params.set('colors', selectedColors.join(','))
    } else {
      params.delete('colors')
    }

    if (priceRange.min > 0) {
      params.set('minPrice', priceRange.min.toString())
    } else {
      params.delete('minPrice')
    }

    if (priceRange.max < 1000000) {
      params.set('maxPrice', priceRange.max.toString())
    } else {
      params.delete('maxPrice')
    }

    if (selectedSort !== 'popular') {
      params.set('sort', selectedSort)
    } else {
      params.delete('sort')
    }

    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const renderCategory = (cat: CategoryNode, depth = 0) => {
    const isActive = currentCategorySlug === cat.slug
    const hasChildren = cat.children && cat.children.length > 0
    const isExpanded = expandedCats.includes(cat.id) || isActive

    return (
      <div key={cat.id} className="space-y-2">
        <div 
          className="flex items-center justify-between group cursor-pointer transition-all"
          style={{ paddingLeft: `${depth * 1.2}rem` }}
        >
          <Link 
            href={isActive ? '/' : `/catalog/${cat.slug}`}
            className={`flex items-center gap-2 flex-grow py-1 ${isActive ? 'text-accent' : 'text-primary/80 hover:text-primary'}`}
          >
            <span className={`text-[11px] uppercase tracking-widest font-bold ${isActive ? 'text-accent' : ''}`}>
              {cat.name}
            </span>
          </Link>
          
          {hasChildren && (
            <button 
              onClick={(e) => toggleExpand(cat.id, e)}
              className={`p-1 hover:bg-gray-100 rounded-md transition-all duration-300 ${isActive ? 'text-accent' : 'text-primary/60 hover:text-primary'}`}
            >
              <ChevronRight className={`w-3.5 h-3.5 stroke-[2.5px] transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
            </button>
          )}
        </div>

        {hasChildren && (
          <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
            <div className="overflow-hidden space-y-1">
              {cat.children!.map(child => renderCategory(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Categories */}
      <div>
        <h4 className="font-serif text-primary mb-8 border-b border-gray-50 pb-4 uppercase tracking-widest text-[11px] font-extrabold flex justify-between items-center">
          Категории
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
        </h4>
        <div className="space-y-4">
          {categories.map((cat) => renderCategory(cat))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <h4 className="font-serif text-primary mb-8 border-b border-gray-50 pb-4 uppercase tracking-widest text-[11px] font-extrabold">
          Цена (Тенге)
        </h4>
        <PriceSlider 
          min={0} 
          max={1000000} 
          step={1000} 
          initialMin={priceRange.min}
          initialMax={priceRange.max}
          onChange={(min, max) => setPriceRange({ min, max })}
        />
      </div>

      {/* Colors */}
      <div>
        <h4 className="font-serif text-primary mb-8 border-b border-gray-50 pb-4 uppercase tracking-widest text-[11px] font-extrabold">
          Цвет
        </h4>
        <div className="flex flex-wrap gap-4">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorToggle(color.value)}
              className={`w-8 h-8 rounded-full ${color.bg} transition-all relative ${selectedColors.includes(color.value) ? 'ring-2 ring-accent ring-offset-2' : 'hover:scale-110'}`}
              title={color.name}
            >
              {selectedColors.includes(color.value) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-1 h-1 rounded-full ${color.value === 'white' ? 'bg-primary' : 'bg-white'}`}></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="font-serif text-primary mb-8 border-b border-gray-50 pb-4 uppercase tracking-widest text-[11px] font-extrabold">
          Бренды
        </h4>
        <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {brands.map((brand) => (
            <label key={brand.id} className="flex items-center gap-4 group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.slug)}
                  onChange={() => handleBrandChange(brand.slug)}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-100 rounded-lg checked:bg-primary checked:border-primary transition-all cursor-pointer hover:border-accent"
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`text-[11px] uppercase tracking-widest font-bold transition-colors ${selectedBrands.includes(brand.slug) ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>
                {brand.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="font-serif text-primary mb-8 border-b border-gray-50 pb-4 uppercase tracking-widest text-[11px] font-extrabold">
          Порядок
        </h4>
        <div className="space-y-4">
          {[
            { label: 'Популярные', value: 'popular' },
            { label: 'Бюджетные', value: 'price-asc' },
            { label: 'Эксклюзивные', value: 'price-desc' },
            { label: 'Новинки', value: 'newest' }
          ].map((option) => (
            <label key={option.value} className="flex items-center gap-4 group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="sort"
                  checked={selectedSort === option.value}
                  onChange={() => setSelectedSort(option.value)}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-100 rounded-full checked:border-accent transition-all cursor-pointer"
                />
                <div className={`absolute w-2 h-2 bg-accent rounded-full transition-opacity ${selectedSort === option.value ? 'opacity-100' : 'opacity-0'}`}></div>
              </div>
              <span className={`text-[11px] uppercase tracking-widest font-bold transition-colors ${selectedSort === option.value ? 'text-primary' : 'text-gray-500 group-hover:text-primary'}`}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-50">
        <button 
          onClick={applyFilters}
          className="w-full bg-primary text-white py-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-all shadow-lg active:scale-95"
        >
          Применить фильтры
        </button>
      </div>
    </div>
  )
}
