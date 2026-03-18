import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const eurocubeData = {
        name: "GROHE Eurocube Смеситель для раковины",
        sku: "23132000",
        description: "Смеситель GROHE Eurocube — это архитектурное совершенство в вашей ванной. Четкие линии и кубические формы подчеркивают современный стиль интерьера. Оснащен технологией плавного хода рычага и экономии воды.",
        attributes: {
            "Коллекция": "Eurocube",
            "Тип монтажа": "На раковину",
            "Цвет": "Хром (StarLight)",
            "Материал": "Латунь",
            "Механизм": "Керамический картридж 28 мм",
            "Вынос излива": "133 мм",
            "Высота излива": "94 мм",
            "Гарантия": "5 лет",
            "Страна бренда": "Германия"
        },
        media: [
            { url: "https://cdn.cloud.grohe.com/prod/20/23/ZZF_23132000_000_01/1280/ZZF_23132000_000_01_1_1.jpg", type: "IMAGE", isPrimary: true },
            { url: "https://www.santehnika-online.ru/upload/iblock/888/grohe_eurocube_23132000_3.jpg", type: "IMAGE", isPrimary: false }
        ]
    };

    const brand = await prisma.brand.upsert({ where: { slug: "grohe" }, update: {}, create: { name: "GROHE", slug: "grohe" } });
    const category = await prisma.category.upsert({
        where: { slug: "premium-selection" },
        update: {},
        create: { name: "Премиум выбор", slug: "premium-selection" }
    });

    await prisma.product.upsert({
        where: { slug: "grohe-eurocube-23132000-premium" },
        update: { attributes: JSON.stringify(eurocubeData.attributes), media: { deleteMany: {}, create: eurocubeData.media } },
        create: {
            name: eurocubeData.name,
            slug: "grohe-eurocube-23132000-premium",
            description: eurocubeData.description,
            brand: { connect: { id: brand.id } },
            category: { connect: { id: category.id } },
            attributes: JSON.stringify(eurocubeData.attributes),
            variants: { create: { sku: "23132000", price: 85000, stock: 10, options: "{}" } },
            media: { create: eurocubeData.media }
        }
    });

    console.log(`[OK] Премиум-товар ${eurocubeData.name} готов к просмотру.`);
}

main().finally(() => prisma.$disconnect());
