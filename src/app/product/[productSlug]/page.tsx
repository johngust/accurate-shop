import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductClient from './ProductClient'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ProductPageProps {
  params: Promise<{ productSlug: string }>
}

export const revalidate = 3600;

export default async function ProductPage({ params }: ProductPageProps) {
  const { productSlug } = await params

  let product: any = null
  try {
    product = await prisma.product.findUnique({
      where: { slug: productSlug },
      include: {
        brand: true,
        category: true,
        media: true,
        variants: true,
      }
    })
  } catch (e) {
    product = null
  }

  if (!product) {
    notFound()
  }

  const bimModel = product.media.find((m: any) => m.type === 'BIM' || m.type === 'MODEL_3D')

  return (
    <div className="bg-white min-h-screen">
      {/* Хлебные крошки */}
      <div className="container mx-auto px-6 py-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
        <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
        <ChevronRight className="w-3 h-3" />
        {product.category && (
          <>
            <Link href={`/catalog/${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        <span className="text-primary font-medium">{product.name}</span>
      </div>

      <div className="container mx-auto px-6 pb-24">
        <ProductClient product={product as any} />
        
        {/* Дополнительная информация под товаром */}
        <div className="mt-24 border-t border-gray-100 pt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h3 className="font-serif text-3xl text-primary mb-8 uppercase tracking-tight">Описание и Характеристики</h3>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-12">
              <p>{product.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-4">
              {Object.entries(JSON.parse(product.attributes || '{}')).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-gray-50 py-3 text-sm">
                  <span className="text-gray-400 font-light capitalize">{key}</span>
                  <span className="text-primary font-medium">{value as string}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-surface p-8 rounded-2xl border border-gray-100">
              <h4 className="font-serif text-lg text-primary mb-6">Сервис и Гарантия</h4>
              <ul className="space-y-6 text-xs uppercase tracking-widest text-gray-500 font-medium">
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-accent shadow-sm">✓</div>
                  <span>Официальная гарантия 5 лет</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-accent shadow-sm">⚓</div>
                  <span>Бесплатный возврат 30 дней</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-accent shadow-sm">🚚</div>
                  <span>Бережная доставка по Казахстану</span>
                </li>
              </ul>
            </div>
            
            {bimModel ? (
              <a 
                href={bimModel.url} 
                download 
                className="w-full py-4 border-2 border-primary text-primary text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-primary hover:text-white transition-all rounded-xl text-center block"
              >
                Скачать {bimModel.type === 'BIM' ? 'BIM' : '3D'} Модель
              </a>
            ) : (
              <button className="w-full py-4 border-2 border-gray-100 text-gray-300 text-[10px] uppercase tracking-[0.2em] font-bold cursor-not-allowed rounded-xl">
                BIM Модель недоступна
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
