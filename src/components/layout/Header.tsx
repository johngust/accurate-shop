import { prisma } from '@/lib/prisma'
import HeaderClient from './HeaderClient'

// export const dynamic = 'force-dynamic';

export default async function Header() {
  let categories: any[] = []
  
  try {
    categories = await prisma.category.findMany({
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
  } catch (error) {
    console.error('Ошибка получения категорий в Header (Build time?):', error)
    // Во время сборки или если БД не настроена, возвращаем пустой массив
    categories = []
  }

  return <HeaderClient categories={categories} />
}
