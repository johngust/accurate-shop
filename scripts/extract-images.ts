import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const FILE_NAME = 'data.xlsx.XLSX';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

async function extractImages() {
    console.log('--- Попытка №3: Извлечение через стрим ---');
    
    if (!fs.existsSync(FILE_NAME)) {
        console.error(`Файл ${FILE_NAME} не найден.`);
        return;
    }

    const workbook = new ExcelJS.Workbook();
    
    try {
        // Попробуем прочитать файл через поток, это иногда обходит ошибки заголовков
        const stream = fs.createReadStream(FILE_NAME);
        await workbook.xlsx.read(stream);
        
        const worksheet = workbook.worksheets[0];
        const images = worksheet.getImages();
        console.log(`Найдено изображений: ${images.length}`);

        for (const img of images) {
            const image = workbook.getImage(Number(img.imageId));
            if (!image || !image.buffer) continue;

            const rowNumber = Math.floor(img.range.tl.nativeRow) + 1;
            const row = worksheet.getRow(rowNumber);
            let sku = row.getCell(6).value?.toString().trim() || '';
            sku = sku.replace(/['"]/g, '');

            if (sku) {
                const fileName = `${sku}.${image.extension || 'png'}`;
                fs.writeFileSync(path.join(OUTPUT_DIR, fileName), Buffer.from(image.buffer));
                console.log(`[OK] ${fileName}`);
            }
        }
    } catch (err: any) {
        console.error('Критическая ошибка ExcelJS:', err.message);
        console.log('Попробуйте пересохранить файл в Excel и запустить снова.');
    }
}

extractImages().catch(console.error);
