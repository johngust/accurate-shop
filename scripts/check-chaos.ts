import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const categories = await prisma.category.findMany({
    where: { name: { contains: '(Test)' } },
    include: { _count: { select: { products: true } } }
  })

  console.log('--- Анализ хаоса в категориях ---')
  categories.forEach(c => {
    console.log(`${c.name} (Slug: ${c.slug}): ${c._count.products} товаров`)
  })
}

main().finally(() => prisma.$disconnect())
