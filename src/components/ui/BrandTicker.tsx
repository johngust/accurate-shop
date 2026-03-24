"use client"

export default function BrandTicker() {
  const brands = ["GROHE", "LEMARK", "ROSSINKA", "HAIBA", "CERSANIT", "BRAVAT", "BELZ"];
  
  return (
    <div className="bg-black py-3 overflow-hidden border-y border-white/5 relative z-20">
      <div className="flex whitespace-nowrap animate-ticker">
        {/* Дублируем список несколько раз для бесконечного эффекта */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center">
                <span className="text-white font-black text-sm tracking-[0.5em] mx-12">
                  {brand}
                </span>
                <div className="h-8 w-[2px] bg-white/40 rotate-[25deg]"></div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: flex;
          width: fit-content;
          animation: ticker 65s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
