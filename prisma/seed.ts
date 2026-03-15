import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Начинаем наполнение базы данных...')

  // Очистка перед наполнением
  await prisma.media.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productRelation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()

  // Бренды
  const grohe = await prisma.brand.create({
    data: { name: 'Grohe', slug: 'grohe' }
  })
  const roca = await prisma.brand.create({
    data: { name: 'Roca', slug: 'roca' }
  })
  const villeroy = await prisma.brand.create({
    data: { name: 'Villeroy & Boch', slug: 'villeroy-boch' }
  })
  const hansgrohe = await prisma.brand.create({
    data: { name: 'Hansgrohe', slug: 'hansgrohe' }
  })

  // Категории с вложенностью
  const categoryData = [
    {
      name: 'Смесители',
      slug: 'faucets',
      children: [
        { name: 'Для раковины', slug: 'basin-faucets' },
        { name: 'Для ванны', slug: 'bath-faucets' },
        { name: 'Для душа', slug: 'shower-faucets' },
        { name: 'Для кухни', slug: 'kitchen-faucets' },
      ]
    },
    {
      name: 'Ванны',
      slug: 'baths',
      children: [
        {
          name: 'Акриловые',
          slug: 'acrylic-baths',
          children: [
            { name: 'Пристенные', slug: 'wall-acrylic-baths' },
            { name: 'Угловые', slug: 'corner-acrylic-baths' },
            { name: 'Отдельностоящие', slug: 'freestanding-acrylic-baths' },
          ]
        },
        { name: 'Стальные', slug: 'steel-baths' },
        { name: 'Чугунные', slug: 'cast-iron-baths' },
      ]
    },
    {
      name: 'Раковины',
      slug: 'sinks',
      children: [
        { name: 'Подвесные', slug: 'wall-hung-sinks' },
        { name: 'Накладные', slug: 'countertop-sinks' },
        { name: 'Встраиваемые', slug: 'built-in-sinks' },
      ]
    },
    {
      name: 'Унитазы',
      slug: 'toilets',
      children: [
        { name: 'Подвесные', slug: 'wall-hung-toilets' },
        { name: 'Напольные', slug: 'floor-standing-toilets' },
        { name: 'Приставные', slug: 'back-to-wall-toilets' },
      ]
    },
    {
      name: 'Кухонные мойки',
      slug: 'kitchen-sinks',
      children: [
        { name: 'Нержавеющая сталь', slug: 'stainless-steel-sinks' },
        { name: 'Гранитные', slug: 'granite-sinks' },
        { name: 'Керамические', slug: 'ceramic-kitchen-sinks' },
      ]
    },
    {
      name: 'Душевые кабины',
      slug: 'showers',
      children: [
        { name: 'Душевые углы', slug: 'shower-enclosures' },
        { name: 'Душевые двери', slug: 'shower-doors' },
        { name: 'Душевые поддоны', slug: 'shower-trays' },
      ]
    }
  ]

  async function createCategoryRecursive(cat: any, parentId: string | null = null) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        parentId: parentId,
      }
    })

    if (cat.children) {
      for (const child of cat.children) {
        await createCategoryRecursive(child, created.id)
      }
    }
    return created
  }

  for (const cat of categoryData) {
    await createCategoryRecursive(cat)
  }

  // Получаем ID созданных категорий для привязки товаров (для примера возьмем первые попавшиеся)
  const allCats = await prisma.category.findMany()
  const faucetCat = allCats.find(c => c.slug === 'basin-faucets') || allCats[0]
  const bathCat = allCats.find(c => c.slug === 'acrylic-baths') || allCats[0]

  // Продукты
  const products = [
    {
      name: 'Смеситель Grohe Eurosmart',
      slug: 'grohe-eurosmart',
      description: 'Классический смеситель для раковины.',
      brandId: grohe.id,
      categoryId: faucetCat.id,
      price: 8500,
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1000'
    },
    {
      name: 'Смеситель Hansgrohe Logis',
      slug: 'hansgrohe-logis',
      description: 'Современный дизайн и немецкое качество.',
      brandId: hansgrohe.id,
      categoryId: faucetCat.id,
      price: 12400,
      image: 'https://images.unsplash.com/photo-1620627812624-38308872e690?q=80&w=1000'
    },
    {
      name: 'Ванна Roca Continental',
      slug: 'roca-continental',
      description: 'Чугунная ванна с антискользящим покрытием.',
      brandId: roca.id,
      categoryId: bathCat.id,
      price: 45000,
      isBulky: true,
      image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1000'
    }
  ]

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        brandId: p.brandId,
        categoryId: p.categoryId,
        isBulky: p.isBulky || false,
        attributes: JSON.stringify({}),
        variants: {
          create: [{ sku: p.slug.toUpperCase(), price: p.price, stock: 20, options: JSON.stringify({}) }]
        },
        media: {
          create: [{ url: p.image, type: 'IMAGE', isPrimary: true }]
        }
      }
    })
  }

  console.log('База данных успешно наполнена!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
