import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const FILE_NAME = 'data.csv.csv';

const CATEGORY_MAP: Record<string, { main: string, keywords: string[] }> = {
    'mixer': { main: 'Смесители', keywords: ['смесител', 'смеситель', 'комплект для ванн'] },
    'sink': { main: 'Раковины', keywords: ['раковин', 'умывальник', 'раковина'] },
    'toilet': { main: 'Унитазы', keywords: ['унитаз', 'инсталляци', 'биде', 'писсуар'] },
    'bath': { main: 'Ванны', keywords: ['ванна', 'ванны', 'поддон'] },
    'shower': { main: 'Душевая программа', keywords: ['душ', 'лейка', 'душев', 'стойка', 'трап'] },
    'furniture': { main: 'Мебель для ванной', keywords: ['зеркало', 'шкаф', 'тумба', 'пенал'] },
    'accs': { main: 'Аксессуары', keywords: ['держатель', 'крючок', 'мыльница', 'ершик', 'полка'] },
    'spare': { main: 'Запчасти', keywords: ['запчаст', 'ремкомплект', 'картридж', 'аэратор', 'шланг', 'кнопка'] }
};

function slugify(text: string) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

async function getCategoryInfo(name: string) {
    const lowerName = name.toLowerCase();
    let mainCatName = 'Прочее';
    for (const [key, config] of Object.entries(CATEGORY_MAP)) {
        if (config.keywords.some(k => lowerName.includes(k))) {
            mainCatName = config.main;
            break;
        }
    }
    const cat = await prisma.category.upsert({
        where: { slug: slugify(mainCatName) },
        update: {},
        create: { name: mainCatName, slug: slugify(mainCatName) }
    });
    return cat.id;
}

async function main() {
    console.log('--- ИМПОРТ ИЗ CSV (БЫСТРЫЙ И ТОЧНЫЙ) ---');

    if (!fs.existsSync(FILE_NAME)) {
        console.error('CSV файл не найден.');
        return;
    }

    const content = fs.readFileSync(FILE_NAME, 'utf8');
    const lines = content.split('\n');
    console.log(`Всего строк в файле: ${lines.length}`);

    // Очистка базы перед импортом
    console.log('Очистка базы...');
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.brand.deleteMany({});

    let imported = 0;
    let withImg = 0;
    const BATCH_SIZE = 100;
    let batch = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(';');
        if (cols.length < 10) continue;

        const code1C = cols[3]?.replace(/\s/g, '').trim(); // Убираем все пробелы
        const sku = cols[5]?.trim();
        const name = cols[7]?.trim();
        const brand = cols[9]?.trim();
        const priceStr = cols[10]?.replace(/\s/g, '').trim() || '0';
        const stockStr = cols[11]?.replace(/\s/g, '').trim() || '0';

        if (!name || name.length < 5) continue;

        batch.push({ code1C, sku, name, brand, price: parseFloat(priceStr), stock: parseInt(stockStr) });

        if (batch.length >= BATCH_SIZE || i === lines.length - 1) {
            await Promise.all(batch.map(async (item) => {
                try {
                    const categoryId = await getCategoryInfo(item.name);
                    let brandId = null;
                    if (item.brand) {
                        const b = await prisma.brand.upsert({
                            where: { slug: slugify(item.brand) },
                            update: {},
                            create: { name: item.brand, slug: slugify(item.brand) }
                        });
                        brandId = b.id;
                    }

                    // Поиск картинки
                    const cleanCode = item.code1C?.replace(/[^a-zA-Z0-9_-]/g, '_');
                    const cleanSku = item.sku?.replace(/[^a-zA-Z0-9_-]/g, '_');
                    let img = null;
                    for (const v of [cleanCode, cleanSku]) {
                        if (v && fs.existsSync(path.join(process.cwd(), 'public/uploads/products', `${v}.png`))) {
                            img = `/uploads/products/${v}.png`;
                            withImg++;
                            break;
                        }
                    }

                    await prisma.product.create({
                        data: {
                            name: item.name,
                            slug: `${slugify(item.name)}-${uuidv4().slice(0, 6)}`,
                            description: `Артикул: ${item.sku || 'н/д'}. Код: ${item.code1C || 'н/д'}`,
                            brandId: brandId!,
                            categoryId,
                            attributes: '{}',
                            variants: {
                                create: {
                                    sku: item.sku || item.code1C || uuidv4(),
                                    price: item.price,
                                    stock: item.stock,
                                    options: '{}'
                                }
                            },
                            media: img ? { create: { url: img, type: 'IMAGE', isPrimary: true } } : undefined
                        }
                    });
                    imported++;
                } catch (e) {}
            }));
            batch = [];
            if (imported % 1000 === 0) console.log(`Прогресс: ${imported}...`);
        }
    }

    console.log(`--- ГОТОВО! ---`);
    console.log(`Товаров в базе: ${imported}. С картинками: ${withImg}`);
}

main().finally(() => prisma.$disconnect());
