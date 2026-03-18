import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const melarSpecs = {
        "Категория": "мебель для ванной",
        "Тип продукта": "тумбы для раковин",
        "Ширина, см": "77.6",
        "Глубина, см": "44.5",
        "Высота, см": "68",
        "Цвет": "белый",
        "Материал корпуса": "лдсп, окрашенное эмалью",
        "Материал фасада": "лдсп, эмаль",
        "Вариант установки": "подвесной/на ножках",
        "Система хранения": "ящики",
        "Сборка": "в сборе",
        "Система открытия": "доводчик",
        "Регулируемый подвесной механизм": "да",
        "Гарантия": "2 года",
        "Вес (без упаковки), кг": "28.9",
        "Вес (в упаковке), кг": "31.2"
    };

    const res = await prisma.product.updateMany({
        where: { name: { contains: "MELAR 80" } },
        data: {
            attributes: JSON.stringify(melarSpecs)
        }
    });

    console.log(`--- ХАРАКТЕРИСТИКИ ОБНОВЛЕНЫ У ${res.count} ТОВАРОВ ---`);
}

main().finally(() => prisma.$disconnect());
