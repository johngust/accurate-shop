import os
import json
from icrawler.builtin import BingImageCrawler
import shutil

# Настройки
DATA_FILE = "data_fixed.json"
TEST_DIR = "public/ai_training_test"
IMG_DIR = "public/uploads/products"

def generate_test():
    print("--- ГЕНЕРАЦИЯ РАСШИРЕННОГО ТЕСТА (15 ТОВАРОВ) ---")
    if os.path.exists(TEST_DIR): shutil.rmtree(TEST_DIR)
    os.makedirs(TEST_DIR)

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        all_data = json.load(f)

    # Расширенный список для обучения
    test_skus = [
        '27974IG0', '27243001', '3924500H', '40364001', '23844003',
        '31491000', '26602000', '40364001', '32661003', '3948500H',
        '27993IG0', '26403001', '23322001', '19354001', '29141000'
    ]
    # Удаляем дубликаты и берем существующие
    test_skus = list(set(test_skus))
    test_items = [d for d in all_data if d['sku'] in test_skus]

    html_content = """
    <html>
    <head>
        <title>AI Training Session V2</title>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f0f; color: #e0e0e0; padding: 40px; margin: 0; }
            .container { max-width: 1400px; margin: 0 auto; }
            h1 { color: #C9A96E; font-size: 32px; border-bottom: 1px solid #333; padding-bottom: 20px; }
            .product-block { background: #1a1a1a; border-radius: 24px; padding: 30px; margin-bottom: 60px; border: 1px solid #333; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            .product-info { margin-bottom: 20px; }
            .product-info h2 { color: #fff; margin: 0; font-size: 22px; }
            .product-info p { color: #888; font-size: 14px; margin: 5px 0; }
            .grid { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 20px; }
            .card { background: #252525; border-radius: 12px; padding: 8px; width: 180px; position: relative; border: 1px solid #333; transition: all 0.2s; }
            .card:hover { border-color: #C9A96E; transform: translateY(-5px); }
            .card img { width: 100%; height: 180px; object-fit: contain; background: white; border-radius: 8px; }
            .card.original { width: 220px; border: 2px solid #C9A96E; background: #2a241a; }
            .card.original img { height: 220px; }
            .num { position: absolute; top: -10px; left: -10px; background: #C9A96E; color: #000; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
            .card.original .num { background: #fff; }
            .label { font-size: 11px; margin-top: 8px; color: #666; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Тренажер обучения ИИ: Выбор идеального HQ фото</h1>
            <p>Инструкция: Сравни 'Оригинал' из Excel с вариантами из сети. Запиши номера тех, что подходят идеально.</p>
    """

    for item in test_items:
        sku = item['sku']
        name = f"{item['brand']} {item['name']}"
        print(f"Обработка {sku}...")
        
        item_folder = os.path.join(TEST_DIR, sku)
        os.makedirs(item_folder)

        # Копируем эталон
        orig_name = f"{sku}.png"
        orig_src = os.path.join(IMG_DIR, orig_name)
        if not os.path.exists(orig_src): orig_src = os.path.join(IMG_DIR, f"{item['code1C']}.png")
        
        has_orig = False
        if os.path.exists(orig_src):
            shutil.copy(orig_src, os.path.join(item_folder, "original.png"))
            has_orig = True

        # Качаем кандидатов
        crawler = BingImageCrawler(storage={'root_dir': item_folder})
        crawler.crawl(keyword=f"{name} official product photo white background", max_num=12)

        # Генерируем HTML блок
        html_content += f"""
        <div class="product-block">
            <div class="product-info">
                <h2>{name}</h2>
                <p>Артикул: {sku} | Бренд: {item['brand']}</p>
            </div>
            <div class="grid">
                <div class="card original">
                    <div class="num">E</div>
                    <img src="ai_training_test/{sku}/original.png">
                    <div class="label">Оригинал Excel</div>
                </div>
        """

        # Добавляем скачанные файлы
        files = [f for f in os.listdir(item_folder) if f.startswith('000')]
        files.sort()
        for i, f in enumerate(files):
            # Путь относительно корня public для Next.js
            img_path = f"ai_training_test/{sku}/{f}"
            html_content += f"""
                <div class="card">
                    <div class="num">{i+1}</div>
                    <img src="{img_path}">
                    <div class="label">Вариант {i+1}</div>
                </div>
            """
        
        html_content += "</div></div>"

    html_content += "</div></body></html>"

    with open("public/ai_training_test.html", "w", encoding="utf-8") as f:
        f.write(html_content)

    print("\n--- ТЕСТ ОБНОВЛЕН ---")
    print(f"Товаров в тесте: {len(test_items)}")
    print("Ссылка: http://localhost:3000/ai_training_test.html")

if __name__ == "__main__":
    generate_test()
