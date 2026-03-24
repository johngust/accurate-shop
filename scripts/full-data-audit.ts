import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Начинаю полный аудит данных...')
  
  const totalProducts = await prisma.product.count()
  const totalVariants = await prisma.productVariant.count()
  const totalCategories = await prisma.category.count()
  const totalBrands = await prisma.brand.count()
  
  console.log(`\n--- ОБЩАЯ СТАТИСТИКА ---`)
  console.log(`Товаров: ${totalProducts}`)
  console.log(`Вариантов: ${totalVariants}`)
  console.log(`Категорий: ${totalCategories}`)
  console.log(`Брендов: ${totalBrands}`)

  // 1. Поиск товаров без вариантов (без цен)
  const productsWithoutVariants = await prisma.product.findMany({
    where: { variants: { none: {} } },
    select: { id: true, name: true, slug: true }
  })

  // 2. Поиск вариантов с ценой 0 или меньше
  const zeroPriceVariants = await prisma.productVariant.findMany({
    where: { price: { lte: 0 } },
    include: { product: { select: { name: true } } }
  })

  // 3. Поиск товаров без изображений
  const productsWithoutImages = await prisma.product.findMany({
    where: { media: { none: { type: 'IMAGE' } } },
    select: { id: true, name: true }
  })

  // 4. Поиск товаров без Primary изображения
  const productsWithoutPrimaryImage = await prisma.product.findMany({
    where: { 
      media: { 
        some: { type: 'IMAGE' },
        none: { isPrimary: true } 
      } 
    },
    select: { id: true, name: true }
  })

  // 5. Поиск категорий без товаров
  const emptyCategories = await prisma.category.findMany({
    where: { products: { none: {} } },
    select: { name: true }
  })

  // 6. Поиск брендов без товаров
  const emptyBrands = await prisma.brand.findMany({
    where: { products: { none: {} } },
    select: { name: true }
  })

  // 7. Поиск товаров с коротким описанием (< 20 симв)
  const shortDescriptions = await prisma.product.count({
    where: { description: { lt: '                    ' } } // Простая проверка длины в SQLite через Prisma может быть ограничена
  })

  console.log(`\n--- РЕЗУЛЬТАТЫ АУДИТА ---`)
  console.log(`❌ Товаров без цен (вариантов): ${productsWithoutVariants.length}`)
  console.log(`❌ Вариантов с нулевой ценой: ${zeroPriceVariants.length}`)
  console.log(`🖼️  Товаров без фото: ${productsWithoutImages.length}`)
  console.log(`⚠️  Товаров без главного фото (isPrimary): ${productsWithoutPrimaryImage.length}`)
  console.log(`📂 Пустых категорий: ${emptyCategories.length}`)
  console.log(`🏷️  Пустых брендов: ${emptyBrands.length}`)
  
  if (productsWithoutVariants.length > 0) {
    console.log('\nПримеры товаров без цен:')
    productsWithoutVariants.slice(0, 5).forEach(p => console.log(`- ${p.name} (${p.slug})`))
  }

  if (zeroPriceVariants.length > 0) {
    console.log('\nПримеры вариантов с 0 ценой:')
    zeroPriceVariants.slice(0, 5).forEach(v => console.log(`- SKU: ${v.sku} (Товар: ${v.product.name})`))
  }

  if (productsWithoutImages.length > 0) {
    console.log('\nПримеры товаров без фото:')
    productsWithoutImages.slice(0, 5).forEach(p => console.log(`- ${p.name}`))
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
