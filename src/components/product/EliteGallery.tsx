'use client'

import { useState, useRef, MouseEvent } from 'react'
import Image from 'next/image'
import { Maximize2, Heart, ChevronLeft, ChevronRight, FileText } from 'lucide-react'

interface MediaItem {
  url: string
  type: string
  isPrimary: boolean
}

interface EliteGalleryProps {
  media: MediaItem[]
  productName: string
  isBulky?: boolean
}

export default function EliteGallery({ media, productName, isBulky }: EliteGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const activeMedia = media[activeIndex] || { url: 'https://via.placeholder.com/800', type: 'IMAGE' }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const { left, top, width, height } = containerRef.current.getBoundingClientRect()
    const x = ((e.pageX - left) / width) * 100
    const y = ((e.pageY - top) / height) * 100
    setZoomPos({ x, y })
  }

  const nextMedia = () => setActiveIndex((prev) => (prev + 1) % media.length)
  const prevMedia = () => setActiveIndex((prev) => (prev - 1 + media.length) % media.length)

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full">
      {/* Миниатюры (вертикальные слева на десктопе) */}
      <div className="flex md:flex-col gap-4 order-2 md:order-1 shrink-0 overflow-x-auto md:overflow-y-auto max-h-[700px] no-scrollbar py-2">
        {media.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`group relative w-24 aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-500 border-2 ${
              activeIndex === idx 
                ? 'border-accent shadow-[0_10px_30px_rgba(201,169,110,0.3)] scale-105' 
                : 'border-transparent opacity-60 hover:opacity-100 hover:scale-102 hover:border-gray-200'
            }`}
          >
            <Image src={item.url} alt="" fill className="object-cover" />
            {item.type === 'SCHEMATIC' && (
              <div className="absolute inset-0 bg-primary/40 flex items-center justify-center text-white">
                <FileText size={20} />
              </div>
            )}
            <div className={`absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
          </button>
        ))}
      </div>

      {/* Основная сцена */}
      <div className="relative flex-grow aspect-[4/5] rounded-[40px] overflow-hidden bg-[#F8FAF9] order-1 md:order-2 shadow-premium group/main border border-gray-100">
        <div 
          ref={containerRef}
          className="relative w-full h-full cursor-zoom-in overflow-hidden"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={activeMedia.url}
            alt={productName}
            fill
            className={`object-contain transition-transform duration-500 ease-out ${
              isZoomed ? 'scale-150 invisible' : 'scale-100'
            }`}
            priority
          />
          
          {/* Zoom Overlay */}
          {isZoomed && (
            <div 
              className="absolute inset-0 z-10 pointer-events-none transition-transform duration-150 ease-out"
              style={{
                backgroundImage: `url(${activeMedia.url})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}
        </div>

        {/* Бейджи и Кнопки */}
        {isBulky && (
          <div className="absolute top-10 left-10 z-20">
            <div className="bg-primary/90 text-white text-[9px] uppercase tracking-[0.3em] px-8 py-3 rounded-full backdrop-blur-xl font-black shadow-premium border border-white/10">
              Elite Logistics / Крупногабарит
            </div>
          </div>
        )}

        <div className="absolute top-10 right-10 flex flex-col gap-4 z-20">
          <button className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-full text-primary hover:bg-accent hover:text-white transition-all duration-500 shadow-premium group/heart">
            <Heart className={`w-5 h-5 transition-transform group-hover/heart:scale-110`} />
          </button>
          <button 
            onClick={() => setIsLightboxOpen(true)}
            className="w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-xl rounded-full text-primary hover:bg-primary hover:text-white transition-all duration-500 shadow-premium"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Навигация (стрелки) */}
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover/main:opacity-100 transition-opacity duration-500">
          <button 
            onClick={(e) => { e.stopPropagation(); prevMedia(); }}
            className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center text-primary pointer-events-auto hover:bg-accent hover:text-white transition-all shadow-premium"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); nextMedia(); }}
            className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center text-primary pointer-events-auto hover:bg-accent hover:text-white transition-all shadow-premium"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Lightbox / Fullscreen Overlay */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-20"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button className="absolute top-10 right-10 text-white/50 hover:text-white text-[11px] uppercase tracking-widest font-bold">
            Закрыть [ESC]
          </button>
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image 
              src={activeMedia.url} 
              alt={productName} 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      )}
    </div>
  )
}
