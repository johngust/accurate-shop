import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const JSON_FILE = 'data_fixed.json';

const CATEGORY_MAP: Record<string, { main: string, keywords: string[] }> = {
    'mixer': { main: 'Смесители', keywords: ['смесител', 'комплект для ванн', 'смеситель'] },
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
    console.log('--- ФИНАЛЬНЫЙ ИМПОРТ ИЗ JSON (PYTHON-CLEANED) ---');

    if (!fs.existsSync(JSON_FILE)) return;
    const items = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

    console.log('Очистка базы...');
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.brand.deleteMany({});

    console.log(`Загрузка ${items.length} товаров...`);

    const BATCH_SIZE = 100;
    let imported = 0;
    let withImg = 0;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (item: any) => {
            try {
                const categoryId = await getCategoryInfo(item.name);
                let brandId = null;
                if (item.brand && item.brand !== 'nan') {
                    const b = await prisma.brand.upsert({
                        where: { slug: slugify(item.brand) },
                        update: {},
                        create: { name: item.brand, slug: slugify(item.brand) }
                    });
                    brandId = b.id;
                }

                const c1 = item.code1C?.replace(/[^a-zA-Z0-9А-Яа-я._-]/g, '_');
                const c2 = item.sku?.replace(/[^a-zA-Z0-9А-Яа-я._-]/g, '_');
                
                let img = null;
                for (const v of [c1, c2]) {
                    if (v && fs.existsSync(path.join(process.cwd(), 'public/uploads/products', `${v}.png`))) {
                        img = `/uploads/products/${v}.png`;
                        break;
                    }
                }

                await prisma.product.create({
                    data: {
                        name: item.name,
                        slug: `${slugify(item.name)}-${uuidv4().slice(0, 6)}`,
                        description: `Артикул: ${item.sku}. Код: ${item.code1C}`,
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
                if (img) withImg++;
            } catch (e) {}
        }));
        if (imported % 1000 === 0) console.log(`Прогресс: ${imported}...`);
    }

    console.log('--- ВСЁ ГОТОВО! ---');
    console.log(`Товаров в базе: ${imported}. С картинками: ${withImg}`);
}

main().finally(() => prisma.$disconnect());
