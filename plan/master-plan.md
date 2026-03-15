# 🚀 Мастер-План: Разработка MVP Гипермаркета Сантехники (AquaSpace)

Данный документ предназначен для ИИ-разработчика. Ваша цель — шаг за шагом создать MVP e-commerce платформы для сантехники (с учетом специфики ниши: 100k+ SKU, крупногабарит, B2B сметы).

## 📊 1. Контекст и Технологический стек
- **Роль:** Senior Full-Stack Next.js Developer.
- **Стек:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma ORM, SQLite (для MVP с переходом на PostgreSQL).
- **Вектор дизайна:** Премиальный минимализм ("чистота", "вода", "люкс").
- **Ключевые бенчмарки:** victorianplumbing.co.uk, build.com, fergusonshowrooms.com.

---

## 🗄️ 2. Схема Базы Данных (Prisma Schema)
Ниже представлена гибридная структура (SQL + JSON-строки для гибких атрибутов сантехники).

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite" // Для MVP используем SQLite
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Category {
  id        String     @id @default(uuid())
  name      String
  slug      String     @unique
  parentId  String?
  parent    Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryToCategory")
  products  Product[]
}

model Brand {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  products  Product[]
}

model Product {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique
  description   String
  brandId       String
  brand         Brand    @relation(fields: [brandId], references: [id])
  categoryId    String
  category      Category @relation(fields: [categoryId], references: [id])
  attributes    String   // В SQLite Prisma не поддерживает Json, используем String для JSON-строки
  isBulky       Boolean  @default(false) 
  isB2BOnly     Boolean  @default(false) 
  variants      ProductVariant[]
  media         Media[]
  relatedFrom   ProductRelation[] @relation("ProductFrom")
  relatedTo     ProductRelation[] @relation("ProductTo")
}

model ProductVariant {
  id          String   @id @default(uuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  sku         String   @unique
  price       Decimal 
  b2bPrice    Decimal?
  stock       Int      @default(0)
  options     String   // JSON-строка атрибутов вариации
}

model Media {
  id          String   @id @default(uuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  url         String
  type        String   // 'IMAGE', 'VIDEO', 'MODEL_3D', 'BIM', 'PDF_MANUAL'
  isPrimary   Boolean  @default(false)
}

model ProductRelation {
  id          String   @id @default(uuid())
  fromId      String
  toId        String
  type        String   // 'CROSS_SELL', 'UP_SELL', 'REQUIRED_PART'
  fromProduct Product  @relation("ProductFrom", fields: [fromId], references: [id])
  toProduct   Product  @relation("ProductTo", fields: [toId], references: [id])
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  role          String   @default("B2C") // 'B2C', 'B2B_CONTRACTOR'
  companyInfo   String?  // JSON-строка
  orders        Order[]
  projects      Project[]
}

model Project {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  name        String
  items       String   // JSON-строка
  createdAt   DateTime @default(now())
}

model Order {
  id               String   @id @default(uuid())
  userId           String?
  user             User?    @relation(fields: [userId], references: [id])
  totalAmount      Decimal
  status           String   // 'PENDING', 'PAID', 'SHIPPING_BULKY', 'DELIVERED'
  requiresLift     Boolean  @default(false)
  hasElevator      Boolean  @default(true)
  requiresAssembly Boolean  @default(false)
  items            OrderItem[]
}

model OrderItem {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  variantSku  String
  quantity    Int
  priceAtBuy  Decimal
}
```

---

## 🎨 3. Дизайн и UI-система (Tailwind + CSS)

### `tailwind.config.ts`
Вам необходимо настроить премиальную палитру:
- **Primary:** `#0D2B45` (Глубокий синий).
- **Accent:** `#C9A96E` (Матовое золото).
- **Surface:** `#F8FAF9` (Off-white для фона).
- **Шрифты:** `Inter` (sans) и `Playfair Display` (serif для заголовков).

### Глобальные компоненты (`globals.css`)
Создайте общие классы:
- `.btn-primary` (синий фон, белый текст, ховер).
- `.btn-accent` (золотой фон, белые текст, shadow-lg).
- `.btn-outline` (прозрачный фон, бордер цвета primary).

---

## 🛠 4. Пошаговые Фазы Разработки

ИИ-разработчик, выполняй задачи **строго последовательно по фазам**.

### Фаза 0: Setup и База
1. Инициализация Next.js с TypeScript и Tailwind (App Router).
2. Настройка `tailwind.config.ts` и `globals.css` (согласно п.3).
3. Инициализация Prisma. Создание схемы (согласно п.2).
4. Написание `prisma/seed.ts` с фейковыми данными (минимум 3 категории: Ванны, Смесители, Раковины; 5-10 товаров с медиа).

### Фаза 1: Layout и Навигация
1. Настроить `app/layout.tsx` (подключить Header, Footer и шрифты).
2. Создать компонент `Header.tsx` (с липкой шапкой (sticky) и поисковой строкой по центру).
3. Создать компонент `MegaMenu.tsx` (выпадающее меню в 3 колонки: Категории / Сегменты / Промо-баннер).

### Фаза 2: Каталог и Фильтры (SSR)
1. Создать серверную страницу каталога `app/catalog/[categorySlug]/page.tsx`. Обязательно использование SSR для SEO.
2. Создать `FilterSidebar.tsx` для фильтрации с чекбоксами (используем update URL searchParams).
3. Создать `ProductCard.tsx` с ховер-эффектами, бейджем "Крупногабарит" (если `isBulky = true`).

### Фаза 3: Карточка Товара
1. Создать страницу `app/product/[productSlug]/page.tsx`.
2. Левая колонка (60%): Вертикальная галерея фото + возможность скачать BIM/3D модель.
3. Правая колонка (40%): Выбор цвета/вариации, кнопка "В корзину", кнопка "в Смету" (для B2B), информация о гарантии.

### Фаза 4: Умный Checkout и B2B (Крупногабарит)
1. Страница `/cart`: Корзина.
2. Создать компонент формы чекаута: **Особая логика логистики**. Если в корзине есть крупногабарит (`hasBulkyItems`), необходимо показать чекбоксы "Нужен ли подъем на этаж?", "Есть ли грузовой лифт?", "Нужен ли монтаж?". Учитывать это в расчете доставки.
3. B2B Кабинет: `/account/projects/page.tsx`. Интерфейс "Мои сметы" для прорабов. Таблица со списком объектов (имя проекта, розничная цена, B2B цена).

### Фаза 5: Главная страница
1. `app/page.tsx`: Полноэкранный Hero-баннер.
2. Блок "Категории" (8 плиток).
3. Слайдер "Популярные товары".

---

## 🤖 5. Инструкции по взаимодействию
- После выполнения каждой фазы всегда запрашивай подтверждение у пользователя.
- Не пытайтесь написать весь код в один гигантский ответ. Двигайтесь мелкими итерациями, сначала структура → потом компонент.
- При проектировании UI делайте упор на чистоту, отступы (whitespace) и премиальный внешний вид. Избегайте дефолтных "дешевых" компонентов.
- Активно используйте `lucide-react` для иконок.
