import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // 1. Пытаемся получить биндинг D1
  // На Cloudflare Pages биндинг доступен через env.DB или process.env.DB
  // Мы используем any, так как в разных версиях Next.js он прокидывается по-разному
  const d1 = (process.env as any).DB;

  if (d1) {
    console.log('📡 Инициализация Prisma с адаптером D1 (Cloudflare)');
    try {
      const adapter = new PrismaD1(d1)
      return new PrismaClient({ adapter })
    } catch (e) {
      console.error('❌ Ошибка при создании PrismaD1 адаптера:', e);
    }
  }

  // 2. FALLBACK: Локальная разработка (Node.js runtime)
  // Здесь мы используем стандартный SQLite драйвер
  if (process.env.NODE_ENV === 'production' && !d1) {
    console.warn('⚠️ ВНИМАНИЕ: Сайт запущен в production, но база данных D1 не найдена. Проверьте биндинги Cloudflare.');
  }

  console.log('💻 Использование стандартного PrismaClient (SQLite/Node.js)');
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
