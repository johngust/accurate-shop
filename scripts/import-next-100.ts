import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()
const JSON_FILE = 'data_fixed.json'

function slugify(text: string) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')
}

async function getCategoryInfo(name: string) {
  const lowerName = name.toLowerCase()
  let mainCatName = 'Прочее'
  const mapping: Record<string, string[]> = {
    'Смесители': ['смесител', 'комплект для ванн'],
    'Раковины': ['раковин', 'умывальник'],
    'Унитазы': ['унитаз', 'инсталляци', 'биде', 'писсуар'],
    'Ванны': ['ванна', 'поддон'],
    'Душевая программа': ['душ', 'лейка', 'душев', 'стойка', 'трап'],
    'Мебель для ванной': ['зеркало', 'шкаф', 'тумба', 'пенал'],
    'Аксессуары': ['держатель', 'крючок', 'мыльница', 'ершик', 'полка'],
    'Запчасти': ['запчаст', 'ремкомплект', 'картридж', 'аэратор', 'шланг', 'кнопка']
  }

  for (const [cat, keywords] of Object.entries(mapping)) {
    if (keywords.some(k => lowerName.includes(k))) {
      mainCatName = cat
      break
    }
  }

  const cat = await prisma.category.upsert({
    where: { slug: slugify(mainCatName) },
    update: {},
    create: { name: mainCatName, slug: slugify(mainCatName) }
  })
  return cat.id
}

async function main() {
  console.log('📦 Импорт следующей пачки товаров (100 штук)...')

  if (!fs.existsSync(JSON_FILE)) {
    console.error('Файл data_fixed.json не найден!')
    return
  }
  
  const items = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'))
  // Берем с 100-го по 200-й, чтобы не дублировать первый тест
  const batch = items.slice(100, 200)

  let imported = 0
  let skipped = 0

  for (const item of batch) {
    try {
      const sku = (item.sku || item.code1C || uuidv4()).toString()
      
      // Проверяем, есть ли уже такой SKU
      const existing = await prisma.productVariant.findUnique({ where: { sku } })
      if (existing) {
        skipped++
        continue
      }

      const categoryId = await getCategoryInfo(item.name)
      let brandId = null
      if (item.brand && item.brand !== 'nan') {
        const b = await prisma.brand.upsert({
          where: { slug: slugify(item.brand) },
          update: {},
          create: { name: item.brand, slug: slugify(item.brand) }
        })
        brandId = b.id
      }

      const c1 = item.code1C?.toString().replace(/[^a-zA-Z0-9А-Яа-я._-]/g, '_')
      const c2 = item.sku?.toString().replace(/[^a-zA-Z0-9А-Яа-я._-]/g, '_')
      
      let img = null
      for (const v of [c1, c2]) {
          if (v && fs.existsSync(path.join(process.cwd(), 'public/uploads/products', `${v}.png`))) {
              img = `/uploads/products/${v}.png`
              break
          }
      }

      await prisma.product.create({
        data: {
          name: item.name,
          slug: `${slugify(item.name)}-${uuidv4().slice(0, 6)}`,
          description: item.description || `Артикул: ${item.sku}. Код: ${item.code1C}`,
          brandId: brandId!,
          categoryId,
          attributes: '{}',
          variants: {
            create: {
              sku,
              price: item.price || 0,
              stock: item.stock || 0,
              options: '{}'
            }
          },
          media: img ? { create: { url: img, type: 'IMAGE', isPrimary: true } } : undefined
        }
      })
      imported++
    } catch (e) {
      console.error(`Ошибка импорта товара ${item.name}:`, e)
    }
  }

  console.log(`\n--- ИТОГ ИМПОРТА ---`)
  console.log(`Импортировано: ${imported}`)
  console.log(`Пропущено (уже есть): ${skipped}`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
