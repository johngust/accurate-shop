import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { products: { _count: 'desc' } }
  })

  console.log('--- СТАТИСТИКА КАТАЛОГА ---')
  categories.forEach(c => {
    if (c._count.products > 0) {
        console.log(`${c.name.padEnd(25)} | Товаров: ${c._count.products}`)
    }
  })

  const totalProducts = await prisma.product.count()
  const withImages = await prisma.media.count({ where: { type: 'IMAGE' } })
  
  console.log('---------------------------')
  console.log(`ВСЕГО ТОВАРОВ В БАЗЕ: ${totalProducts}`)
  console.log(`ТОВАРОВ С КАРТИНКАМИ: ${withImages}`)
}

main().finally(() => prisma.$disconnect())
