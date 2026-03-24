import { prisma } from '@/lib/prisma'
import HeaderClient from './HeaderClient'

export const dynamic = 'force-dynamic';

export default async function Header() {
  const categories = await prisma.category.findMany({
    where: { 
      parentId: null,
      OR: [
        { products: { some: {} } },
        { children: { some: { products: { some: {} } } } }
      ]
    },
    include: { 
      children: {
        where: { products: { some: {} } }
      } 
    },
    orderBy: { name: 'asc' }
  })

  return <HeaderClient categories={categories} />
}
