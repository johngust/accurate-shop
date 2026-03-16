'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // When pathname changes, we show the loading bar briefly
    setIsNavigating(true)
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 500) // Match this with your visual preference

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className="relative">
      {isNavigating && <div className="loading-bar shadow-[0_0_10px_rgba(201,169,110,0.5)]" />}
      <div key={pathname} className="animate-page-in">
        {children}
      </div>
    </div>
  )
}
