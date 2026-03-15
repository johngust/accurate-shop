import { prisma } from '@/lib/prisma'
import FilterForm from './FilterForm'

interface FilterSidebarProps {
  categorySlug?: string
}

export default async function FilterSidebar({ categorySlug }: FilterSidebarProps) {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  })

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Рекурсивно приводим категории к формату FilterForm
  const formatCategories = (cats: any[]): any[] => {
    return cats.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      children: c.children ? formatCategories(c.children) : []
    }))
  }

  return (
    <aside className="w-80 shrink-0 hidden lg:block font-sans">
      <div className="sticky top-32 bg-white border border-gray-100 p-10 shadow-premium ring-1 ring-black/5 rounded-luxury">
        <FilterForm 
          brands={brands.map(b => ({ id: b.id, name: b.name, slug: b.slug }))}
          categories={formatCategories(categories)}
          currentCategorySlug={categorySlug}
        />
      </div>
    </aside>
  )
}
