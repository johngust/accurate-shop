'use client'

import { useState, useEffect } from 'react'

interface PriceSliderProps {
  min: number
  max: number
  step: number
  initialMin?: number
  initialMax?: number
  onChange?: (min: number, max: number) => void
}

export default function PriceSlider({ min, max, step, initialMin, initialMax, onChange }: PriceSliderProps) {
  const [minValue, setMinValue] = useState(initialMin ?? min)
  const [maxValue, setMaxValue] = useState(initialMax ?? max)

  useEffect(() => {
    if (onChange) {
      onChange(minValue, maxValue)
    }
  }, [minValue, maxValue])

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxValue - step)
    setMinValue(value)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minValue + step)
    setMaxValue(value)
  }

  const minPercent = (minValue / max) * 100
  const maxPercent = (maxValue / max) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1 font-bold">От</span>
          <div className="relative">
            <input 
              type="number" 
              value={minValue}
              onChange={(e) => setMinValue(Number(e.target.value))}
              className="w-full bg-surface border border-gray-100 rounded-lg px-3 py-2 text-[11px] font-bold text-primary focus:outline-none focus:border-accent transition-colors" 
            />
          </div>
        </div>
        <div className="flex-1">
          <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-1 font-bold">До</span>
          <div className="relative">
            <input 
              type="number" 
              value={maxValue}
              onChange={(e) => setMaxValue(Number(e.target.value))}
              className="w-full bg-surface border border-gray-100 rounded-lg px-3 py-2 text-[11px] font-bold text-primary focus:outline-none focus:border-accent transition-colors" 
            />
          </div>
        </div>
      </div>

      <div className="relative h-6 flex items-center">
        {/* Track Background */}
        <div className="absolute w-full h-1 bg-gray-100 rounded-full"></div>
        
        {/* Active Range */}
        <div 
          className="absolute h-1 bg-accent rounded-full" 
          style={{ 
            left: `${minPercent}%`, 
            right: `${100 - maxPercent}%` 
          }}
        ></div>

        {/* Inputs Range */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-20"
          style={{ WebkitAppearance: 'none' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-20"
          style={{ WebkitAppearance: 'none' }}
        />
        
        {/* Handles Visuals */}
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-accent rounded-full shadow-md z-30 pointer-events-none -ml-2"
          style={{ left: `${minPercent}%` }}
        ></div>
        <div 
          className="absolute w-4 h-4 bg-white border-2 border-accent rounded-full shadow-md z-30 pointer-events-none -ml-2"
          style={{ left: `${maxPercent}%` }}
        ></div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          pointer-events: all;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          background: transparent;
        }
        input[type='range']::-moz-range-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          background: transparent;
        }
      `}} />
    </div>
  )
}
