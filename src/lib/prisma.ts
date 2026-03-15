import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

export const runtime = 'edge'

const createPrismaClient = () => {
  // Проверяем, находимся ли мы в среде Cloudflare с доступом к D1
  if (process.env.NODE_ENV === 'production' || (globalThis as any).DB) {
    const adapter = new PrismaD1((globalThis as any).DB)
    return new PrismaClient({ adapter })
  }
  
  // Для локальной разработки используем стандартный SQLite
  return new PrismaClient()
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
