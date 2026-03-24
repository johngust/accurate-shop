import { PrismaClient } from '@prisma/client'

const createPrismaClient = () => {
  // Если мы в процессе билда и нет DATABASE_URL, возвращаем пустой клиент, чтобы не падать
  if (process.env.NEXT_PHASE === 'phase-production-build' && !process.env.DATABASE_URL) {
    return new PrismaClient({
      datasources: {
        db: {
          url: 'file:./dev.db'
        }
      }
    })
  }
  return new PrismaClient()
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
