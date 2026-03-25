import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

// Тип для глобального объекта Prisma (чтобы не создавать много подключений при разработке)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // ПРОВЕРКА: Если мы в среде Cloudflare (есть привязка к D1)
  // В Next.js на Cloudflare база обычно доступна через process.env.DB
  const d1 = (process.env as any).DB;

  if (d1) {
    console.log('📡 Подключение к Cloudflare D1 через адаптер');
    const adapter = new PrismaD1(d1)
    return new PrismaClient({ adapter })
  }

  // FALLBACK: Локальная разработка или Build-фаза
  console.log('💻 Использование стандартного Prisma Client (SQLite)');
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
