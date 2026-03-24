import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Начинаю умную очистку каталога...')

  // 1. Удаляем товары без вариантов (цен)
  const productsToDelete = await prisma.product.findMany({
    where: { variants: { none: {} } },
    select: { id: true, name: true }
  })

  for (const p of productsToDelete) {
    // Удаляем связанные медиа (если есть)
    await prisma.media.deleteMany({ where: { productId: p.id } })
    await prisma.product.delete({ where: { id: p.id } })
    console.log(`✅ Удален товар без цены: ${p.name}`)
  }

  // 2. Удаляем пустые категории
  const emptyCategories = await prisma.category.findMany({
    where: { products: { none: {} } },
    select: { id: true, name: true }
  })

  for (const c of emptyCategories) {
    await prisma.category.delete({ where: { id: c.id } })
    console.log(`✅ Удалена пустая категория: ${c.name}`)
  }

  console.log(`\n--- ИТОГ ОЧИСТКИ ---`)
  console.log(`Удалено товаров: ${productsToDelete.length}`)
  console.log(`Удалено категорий: ${emptyCategories.length}`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
