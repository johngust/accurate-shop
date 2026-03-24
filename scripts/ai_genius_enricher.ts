import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- AI GENIUS ENRICHER: ТЕХНИЧЕСКАЯ МОДЕРНИЗАЦИЯ КАТАЛОГА ---');

    const products = await prisma.product.findMany({
        include: { brand: true, category: true, variants: true }
    });

    console.log(`Анализ ${products.length} товаров...`);

    for (const p of products) {
        const name = p.name.toLowerCase();
        const sku = p.variants[0]?.sku.toUpperCase() || "";
        const brand = p.brand.name.toUpperCase();
        
        let attributes: any = {};
        try { attributes = JSON.parse(p.attributes || '{}'); } catch (e) { attributes = {}; }

        let newDescription = p.description;

        // 1. ЛОГИКА ДЛЯ GROHE
        if (brand.includes('GROHE')) {
            attributes["Технология картриджа"] = "GROHE SilkMove (керамические диски)";
            attributes["Покрытие"] = "GROHE StarLight (износостойкое)";
            
            if (sku.includes('IG0')) {
                attributes["Тип покрытия"] = "PVD (физическое осаждение фазы)";
                attributes["Цвет"] = "Холодный рассвет (Cool Sunrise)";
                attributes["Прочность"] = "2500 HV (в 10 раз тверже хрома)";
            }
            
            if (name.includes('термостат')) {
                attributes["Термоэлемент"] = "GROHE TurboStat (реакция 0.3 сек)";
                attributes["Безопасность"] = "SafeStop 38°C / CoolTouch (корпус не греется)";
            }
            
            if (name.includes('ecojoy') || name.includes('экономия')) {
                attributes["Расход воды"] = "5.7 л/мин (Технология EcoJoy)";
            }
        }

        // 2. ЛОГИКА ДЛЯ GEBERIT / ALCAPLAST
        if (brand.includes('GEBERIT') || brand.includes('ALCA')) {
            if (name.includes('кнопка') || name.includes('клавиша')) {
                if (name.includes('sigma') || sku.includes('115.')) {
                    attributes["Совместимость"] = "ТОЛЬКО с бачками Geberit Sigma (12см/8см)";
                    attributes["Тип привода"] = "Механический / Пневматический";
                }
            }
            if (name.includes('инсталляция')) {
                attributes["Нагрузка"] = "До 400 кг (Стандарт DIN EN 997)";
                attributes["Защита"] = "Изоляция от конденсата";
            }
        }

        // 3. ЛОГИКА ДЛЯ КЕРАМИКИ (УНИТАЗЫ/РАКОВИНЫ)
        if (p.categoryId) {
            if (name.includes('rimless') || name.includes('безободков')) {
                attributes["Тип смыва"] = "Rimless (полная гигиена, без скрытых зон)";
                attributes["Материал"] = "Санитарный фарфор (Sanitary Porcelain)";
            }
            if (name.includes('soft close') || name.includes('микролифт')) {
                attributes["Сиденье"] = "С механизмом плавного закрытия (SoftClose)";
            }
        }

        // 4. ЛОГИКА ДЛЯ ВАНН
        if (name.includes('ванна')) {
            if (name.includes('акрил')) {
                attributes["Материал"] = "100% литьевой акрил (PMMA)";
                attributes["Толщина листа"] = "4-6 мм";
            } else if (name.includes('чугун')) {
                attributes["Материал"] = "Чугун с титановой эмалью";
                attributes["Срок службы"] = "от 25 лет";
            }
        }

        // Финальное обновление
        await prisma.product.update({
            where: { id: p.id },
            data: {
                attributes: JSON.stringify(attributes),
                description: newDescription.includes('Технологии:') ? newDescription : `${newDescription}\n\nТехнологии: ${Object.keys(attributes).slice(0, 3).join(', ')}.`
            }
        });
    }

    console.log('--- ТЕХНИЧЕСКАЯ ПРОКАЧКА ЗАВЕРШЕНА ---');
}

main().finally(() => prisma.$disconnect());
