import { PrismaClient } from '@prisma/client';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const FILE_NAME = 'data.xlsx.XLSX';

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
    console.log('--- ПОБЕДНЫЙ ИМПОРТ V6 (ИСПРАВЛЕННЫЙ ПАРСИНГ XML) ---');

    if (!fs.existsSync(FILE_NAME)) return;
    const zip = new AdmZip(FILE_NAME);

    // 1. Strings
    const stringsXml = zip.getEntry('xl/sharedStrings.xml')?.getData().toString('utf8') || '';
    const sharedStrings: string[] = [];
    const siBlocks = stringsXml.matchAll(/<si>(.*?)<\/si>/sg);
    for (const si of siBlocks) {
        const tMatches = si[1].matchAll(/<t[^>]*>(.*?)<\/t>/g);
        let fullText = '';
        for (const t of tMatches) fullText += t[1];
        sharedStrings.push(fullText);
    }

    // 2. Sheet
    const sheetXml = zip.getEntry('xl/worksheets/sheet1.xml')?.getData().toString('utf8') || '';
    const rowMatches = sheetXml.matchAll(/<row r="(\d+)"[^>]*>(.*?)<\/row>/sg);
    
    let products = [];
    for (const rowMatch of rowMatches) {
        const rowInner = rowMatch[2];
        const rowData: Record<string, string> = {};
        
        // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: \s* учитывает переносы строк и отступы в XML
        const cellMatches = rowInner.matchAll(/<c r="([A-Z]+)\d+"[^>]*?(?:t="([^"]+)")?[^>]*>\s*<v>([^<]+)<\/v>\s*<\/c>/sg);
        for (const c of cellMatches) {
            const colLetter = c[1];
            const type = c[2];
            const val = c[3];
            rowData[colLetter] = (type === 's') ? sharedStrings[parseInt(val)] : val;
        }

        const sku = rowData['F']?.trim();
        const name = rowData['H']?.trim();
        const brand = rowData['J']?.trim();
        const price = parseFloat(rowData['K'] || '0');
        const stock = parseInt(rowData['L'] || '0');
        const code1C = rowData['D']?.trim();

        if (name && name.length > 3 && sku) {
            products.push({ sku, name, brand, price, stock, code1C });
        }
    }

    console.log(`Успешно распарсено товаров: ${products.length}`);
    if (products.length > 0) {
        console.log('--- ПЕРВАЯ ПОЗИЦИЯ ДЛЯ ПРОВЕРКИ ---');
        console.log(`Название: ${products[0].name}`);
        console.log(`Артикул: ${products[0].sku}`);
        console.log(`Бренд: ${products[0].brand}`);
        console.log(`Цена: ${products[0].price} ₸`);
    }

    // 3. База
    console.log('Очистка базы...');
    await prisma.media.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.brand.deleteMany({});

    const BATCH_SIZE = 100;
    let imported = 0;
    let withImg = 0;

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
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

                // Поиск картинки (как в скрипте извлечения v2.2)
                const variants = [
                    item.sku?.replace(/[^a-zA-Z0-9А-Яа-я._-]/g, '_'),
                    item.code1C?.replace(/[^a-zA-Z0-9А-Яа-я._-]/g, '_')
                ].filter(Boolean);

                let img = null;
                for (const v of variants) {
                    if (fs.existsSync(path.join(process.cwd(), 'public/uploads/products', `${v}.png`))) {
                        img = `/uploads/products/${v}.png`;
                        withImg++;
                        break;
                    }
                }

                await prisma.product.create({
                    data: {
                        name: item.name,
                        slug: `${slugify(item.name)}-${uuidv4().slice(0, 6)}`,
                        description: `Артикул: ${item.sku}. Код: ${item.code1C || 'н/д'}`,
                        brandId: brandId!,
                        categoryId,
                        attributes: '{}',
                        variants: {
                            create: {
                                sku: item.sku,
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
        if (imported % 1000 === 0) console.log(`Прогресс: ${imported}...`);
    }
    console.log('--- ПОБЕДА! ИМПОРТ ЗАВЕРШЕН ---');
    console.log(`Товаров в базе: ${imported}. С картинками: ${withImg}`);
}

main().finally(() => prisma.$disconnect());
