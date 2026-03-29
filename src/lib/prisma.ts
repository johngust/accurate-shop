import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // 1. Проверяем наличие D1 (Cloudflare Runtime / Pages Binding)
  // На Cloudflare Pages биндинг доступен через env.DB или process.env.DB
  const d1 = (process.env as any).DB;

  if (d1) {
    console.log('📡 Инициализация Prisma с адаптером D1');
    try {
      const adapter = new PrismaD1(d1)
      return new PrismaClient({ adapter })
    } catch (e) {
      console.error('❌ Ошибка при инициализации адаптера D1:', e);
    }
  }

  // 2. FALLBACK: Локальная разработка или Build Time
  // Если мы в PRODUCTION и здесь оказались - значит D1 не подключен
  if (process.env.NODE_ENV === 'production' && !d1) {
    console.warn('⚠️ ВНИМАНИЕ: D1 не найден в production. Проверьте биндинги Cloudflare.');
  }

  console.log('💻 Использование стандартного PrismaClient (SQLite/Postgres)');
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
