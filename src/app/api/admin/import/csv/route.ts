import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

export const runtime = "edge";

// Оставляем Node.js runtime для работы с Prisma, но используем Response со стримом
const EXPERIMENTAL_LIMIT = 20;
const SAFETY_TAG = '[EXPERIMENTAL_BATCH_1]';

const CATEGORY_MAP: Record<string, { main: string, keywords: string[] }> = {
    'mixer': { main: 'Смесители', keywords: ['смесител', 'комплект для ванн'] },
    'sink': { main: 'Раковины', keywords: ['раковин', 'умывальник'] },
    'toilet': { main: 'Унитазы', keywords: ['унитаз', 'инсталляци'] },
    'bath': { main: 'Ванны', keywords: ['ванна', 'ванны'] },
    'shower': { main: 'Душевая программа', keywords: ['душ', 'лейка', 'душев'] },
    'spare': { main: 'Запчасти', keywords: ['запчаст', 'ремкомплект', 'картридж', 'аэратор'] }
};

function slugify(text: string) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

async function getCategoryInfo(name: string) {
    const lowerName = name.toLowerCase();
    const words = lowerName.split(/[\s,]+/);
    
    let mainCatName = 'Прочее';
    let subCatName = null;

    const sparePartConfig = CATEGORY_MAP['spare'];
    const isSparePart = sparePartConfig ? sparePartConfig.keywords.some(k => lowerName.includes(k)) : false;
    
    if (isSparePart) {
        mainCatName = 'Запчасти';
        if (lowerName.includes('смесител')) subCatName = 'Для смесителей';
        else if (lowerName.includes('унитаз')) subCatName = 'Для унитазов';
    } else {
        for (const [key, config] of Object.entries(CATEGORY_MAP)) {
            if (key === 'spare') continue;
            if (config.keywords.some(k => lowerName.includes(k))) {
                mainCatName = config.main;
                const forIndex = words.findIndex(w => w === 'для' || w === 'под');
                if (forIndex !== -1 && words[forIndex + 1]) {
                    subCatName = words[forIndex + 1]
                        .replace(/[.,]/g, '')
                        .charAt(0).toUpperCase() + words[forIndex + 1].slice(1);
                    if (words[forIndex + 1].includes('столешниц')) subCatName = 'Под столешницу';
                }
                break;
            }
        }
    }

    const testMainCatName = `${mainCatName} (Test)`;
    const mainCat = await prisma.category.upsert({
        where: { slug: slugify(testMainCatName) },
        update: {},
        create: { name: testMainCatName, slug: slugify(testMainCatName) }
    });

    let finalCatId = mainCat.id;

    if (subCatName) {
        const fullSubName = `${subCatName} (Test)`;
        const subCat = await prisma.category.upsert({
            where: { slug: slugify(`${testMainCatName}-${fullSubName}`) },
            update: {},
            create: { 
                name: fullSubName, 
                slug: slugify(`${testMainCatName}-${fullSubName}`),
                parentId: mainCat.id
            }
        });
        finalCatId = subCat.id;
    }

    return finalCatId;
}

export async function POST(req: Request) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: any) => {
                controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
            };

            try {
                const formData = await req.formData();
                const file = (formData as any).get('file') as File;
                if (!file) {
                    send({ type: 'error', message: 'Файл не найден' });
                    controller.close();
                    return;
                }

                const arrayBuffer = await file.arrayBuffer();
                // Используем windows-1251 для корректного чтения кириллицы из Excel CSV
                const text = new TextDecoder('windows-1251').decode(arrayBuffer);
                const lines = text.split(/\r?\n/);
                
                const sampleLine = lines[21] || lines[0] || '';
                const delimiter = sampleLine.includes(';') ? ';' : ',';

                const dataLines = lines.slice(21);
                const totalToImport = Math.min(dataLines.length, EXPERIMENTAL_LIMIT);
                
                send({ type: 'start', total: totalToImport });

                let imported = 0;
                let skipped = 0;

                for (let i = 0; i < dataLines.length; i++) {
                    if (imported >= EXPERIMENTAL_LIMIT) break;
                    
                    const line = dataLines[i];
                    if (!line.trim()) continue;

                    const col = line.split(delimiter);
                    
                    // ДИАГНОСТИКА: Выводим структуру первой строки в терминал
                    if (imported === 0) {
                        send({ 
                            type: 'info', 
                            message: `[DEBUG] Структура колонок первой строки: ${col.map((c, i) => `[C${i+1}: ${c}]`).join(' | ').slice(0, 200)}...` 
                        });
                    }

                    const img = col[1]?.trim();  // C2
                    const sku = col[5]?.trim();  // C6
                    const name = col[7]?.trim(); // C8
                    const brand = col[9]?.trim(); // C10
                    const stockValue = col[11]?.trim()?.replace(/\s/g, ''); 
                    const stock = parseInt(stockValue || '0');

                    if (!name || !sku) {
                        skipped++;
                        continue;
                    }

                    try {
                        const categoryId = await getCategoryInfo(name);

                        let brandId = null;
                        if (brand) {
                            const b = await prisma.brand.upsert({
                                where: { slug: slugify(`${brand}-test`) },
                                update: {},
                                create: { name: `${brand} (Test)`, slug: slugify(`${brand}-test`) }
                            });
                            brandId = b.id;
                        }

                        await prisma.product.create({
                            data: {
                                name,
                                slug: `${slugify(name)}-test-${uuidv4().slice(0, 4)}`,
                                description: `${SAFETY_TAG} Импортировано. Оригинал: ${name}`,
                                brandId: brandId as any,
                                categoryId: categoryId,
                                attributes: '{}',
                                variants: {
                                    create: { 
                                        sku, 
                                        price: 0, 
                                        stock,
                                        options: '{}' // ИСПРАВЛЕНО: добавлено обязательное поле
                                    }
                                },
                                media: img ? { create: { url: img, type: 'IMAGE', isPrimary: true } } : undefined
                            }
                        });
                        
                        imported++;
                        
                        // Отправляем прогресс в реальном времени с инфой об изображении
                        send({ 
                            type: 'progress', 
                            current: imported, 
                            total: totalToImport, 
                            name, 
                            sku,
                            imported,
                            skipped,
                            imageStatus: img ? `Найдено: ${img.slice(0, 30)}...` : 'Изображение отсутствует'
                        });

                        if (img) {
                            send({ 
                                type: 'info', 
                                message: `[IMG_INFO] Артикул ${sku}: путь картинки -> ${img}` 
                            });
                        }

                    } catch (err: any) {
                        skipped++;
                        send({ 
                            type: 'error', 
                            sku, 
                            message: `КРИТИЧЕСКАЯ ОШИБКА: Импорт остановлен из-за сбоя в строке ${sku}. Причина: ${err.message}` 
                        });
                        // Прекращаем выполнение цикла при первой же ошибке
                        break;
                    }
                }

                send({ 
                    type: 'complete', 
                    stats: { imported, skipped, total: totalToImport } 
                });

            } catch (error: any) {
                send({ type: 'error', message: error.message });
            } finally {
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'application/x-ndjson',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
