import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const prisma = new PrismaClient();
const IMG_DIR = path.join(process.cwd(), 'public', 'uploads', 'products');

async function downloadImage(url: string, fileName: string) {
    const filePath = path.join(IMG_DIR, fileName);
    console.log(`Скачивание: ${url} -> ${fileName}`);
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (e: any) {
        console.error(`Ошибка скачивания ${fileName}: ${e.message}`);
        return null;
    }
}

async function main() {
    if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

    const sku = "23132000";
    const images = [
        { url: "https://cdn.cloud.grohe.com/prod/20/23/ZZF_23132000_000_01/1280/ZZF_23132000_000_01_1_1.jpg", name: `eurocube_1_${sku}.jpg` },
        { url: "https://www.santehnika-online.ru/upload/iblock/888/grohe_eurocube_23132000_3.jpg", name: `eurocube_2_${sku}.jpg` }
    ];

    const localPaths = [];
    for (const img of images) {
        await downloadImage(img.url, img.name);
        localPaths.push(`/uploads/products/${img.name}`);
    }

    const product = await prisma.product.findFirst({
        where: { variants: { some: { sku } } }
    });

    if (product) {
        await prisma.media.deleteMany({ where: { productId: product.id } });
        await prisma.media.createMany({
            data: localPaths.map((url, index) => ({
                productId: product.id,
                url,
                type: 'IMAGE',
                isPrimary: index === 0
            }))
        });
        console.log(`--- КАРТИНКИ EUROCUBE ТЕПЕРЬ ЛОКАЛЬНЫЕ ---`);
    }
}

main().finally(() => prisma.$disconnect());
