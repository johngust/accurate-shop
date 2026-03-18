import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

const FILE_NAME = 'data.xlsx.XLSX';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

async function extractImages() {
    console.log('--- Попытка №6: Парсинг с учетом структуры XML (отступы и переносы) ---');
    
    if (!fs.existsSync(FILE_NAME)) {
        console.error(`Файл ${FILE_NAME} не найден.`);
        return;
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const zip = new AdmZip(FILE_NAME);
    
    // 1. Маппинг медиа
    const relsEntry = zip.getEntry('xl/drawings/_rels/drawing1.xml.rels');
    if (!relsEntry) return;
    const relsXml = relsEntry.getData().toString('utf8');
    const mediaMap: Record<string, string> = {};
    const relMatches = relsXml.matchAll(/Id="([^"]+)"[^>]+Target="..\/media\/([^"]+)"/g);
    for (const match of relMatches) {
        mediaMap[match[1]] = `xl/media/${match[2]}`;
    }

    // 2. Маппинг позиций
    const drawingEntry = zip.getEntry('xl/drawings/drawing1.xml');
    if (!drawingEntry) return;
    const drawingXml = drawingEntry.getData().toString('utf8');
    const positionMap: Record<string, number> = {};
    const anchorRegex = /<twoCellAnchor>.*?<from>.*?<row>(\d+)<\/row>.*?r:embed="([^"]+)"/sg;
    const anchorMatches = drawingXml.matchAll(anchorRegex);
    for (const match of anchorMatches) {
        positionMap[match[2]] = parseInt(match[1]);
    }
    console.log(`Связей картинка -> строка: ${Object.keys(positionMap).length}`);

    // 3. Shared Strings
    const stringsEntry = zip.getEntry('xl/sharedStrings.xml');
    if (!stringsEntry) return;
    const stringsXml = stringsEntry.getData().toString('utf8');
    const sharedStrings: string[] = [];
    const tMatches = stringsXml.matchAll(/<t[^>]*>(.*?)<\/t>/g);
    for (const match of tMatches) {
        sharedStrings.push(match[1]);
    }

    // 4. SKU из листа (Колонка F)
    const sheetEntry = zip.getEntry('xl/worksheets/sheet1.xml');
    if (!sheetEntry) return;
    const sheetXml = sheetEntry.getData().toString('utf8');
    const rowToSku: Record<number, string> = {};
    
    // Новая регулярка для ячеек F, учитывающая вложенность и пробелы
    const cellRegex = /<c r="F(\d+)"[^>]*?t="s"[^>]*>\s*<v>(\d+)<\/v>\s*<\/c>/sg;
    const cellMatches = sheetXml.matchAll(cellRegex);
    for (const match of cellMatches) {
        const rowIndex = parseInt(match[1]) - 1;
        const stringIndex = parseInt(match[2]);
        const sku = sharedStrings[stringIndex]?.trim();
        if (sku) {
            // Очищаем SKU от мусора
            rowToSku[rowIndex] = sku.replace(/[^a-zA-Z0-9А-Яа-я._-]/g, '_');
        }
    }
    console.log(`Найдено артикулов в колонке F: ${Object.keys(rowToSku).length}`);

    // 5. Извлечение
    let successCount = 0;
    for (const [rId, rowIndex] of Object.entries(positionMap)) {
        const sku = rowToSku[rowIndex];
        const mediaPath = mediaMap[rId];
        
        if (sku && mediaPath) {
            const entry = zip.getEntry(mediaPath);
            if (entry) {
                const ext = path.extname(mediaPath) || '.png';
                const fileName = `${sku}${ext}`;
                fs.writeFileSync(path.join(OUTPUT_DIR, fileName), entry.getData());
                successCount++;
                if (successCount % 500 === 0) console.log(`Извлечено: ${successCount}...`);
            }
        }
    }

    console.log(`--- ФИНИШ ---`);
    console.log(`Всего извлечено: ${successCount} картинок.`);
}

extractImages().catch(console.error);
