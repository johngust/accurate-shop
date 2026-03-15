import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Expand } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    isBulky: boolean
    brand: { name: string }
    media: { url: string }[]
    variants: { price: any }[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.media.find(m => m) || { url: 'https://via.placeholder.com/400' }
  const price = product.variants[0]?.price ? Number(product.variants[0].price).toLocaleString('ru-RU') : 'Цена по запросу'

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Image
          src={primaryImage.url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isBulky && (
            <span className="bg-primary/90 text-white text-xs uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
              Крупногабарит
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button className="p-3 bg-white text-primary rounded-full hover:bg-accent hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white text-primary rounded-full hover:bg-accent hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <span className="text-xs text-accent uppercase tracking-widest mb-2 block font-medium">
          {product.brand.name}
        </span>
        <Link href={`/product/${product.slug}`} className="block mb-4">
          <h3 className="font-serif text-lg text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xl font-medium text-primary">
            {price} <span className="text-sm font-normal text-gray-400">тг.</span>
          </span>
          <Link
            href={`/product/${product.slug}`}
            className="text-xs text-gray-400 hover:text-accent flex items-center gap-1 transition-colors uppercase tracking-widest"
          >
            Детали <Expand className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
