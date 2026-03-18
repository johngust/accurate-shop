import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const product = await prisma.product.findFirst({
    include: { variants: true, media: true }
  })
  console.log('--- ДЕБАГ ТОВАРА ---')
  console.log(JSON.stringify(product, null, 2))
}

main().finally(() => prisma.$disconnect())
