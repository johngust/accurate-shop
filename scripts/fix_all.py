import pandas as pd
import chardet
import os
import json
from PIL import Image, ImageEnhance, ImageFilter

CSV_FILE = 'data.csv.csv'
IMG_DIR = 'public/uploads/products'
OUTPUT_JSON = 'data_fixed.json'

def fix_encoding_and_data():
    print("--- 1. Исправление кодировки и данных ---")
    
    # Определяем кодировку
    with open(CSV_FILE, 'rb') as f:
        rawdata = f.read(10000)
        result = chardet.detect(rawdata)
        enc = result['encoding']
        print(f"Обнаружена кодировка: {enc}")

    # Читаем CSV (разделитель ;)
    df = pd.read_csv(CSV_FILE, sep=';', encoding=enc, header=None)
    
    # Маппинг колонок (как мы выяснили: 3-D, 5-F, 7-H, 9-J, 10-K, 11-L)
    # Очищаем данные
    df = df[[3, 5, 7, 9, 10, 11]].dropna(subset=[7]) # Оставляем только строки с названиями
    df.columns = ['code1C', 'sku', 'name', 'brand', 'price', 'stock']
    
    # Чистим числа и строки
    df['code1C'] = df['code1C'].astype(str).str.replace(r'\s+', '', regex=True)
    df['sku'] = df['sku'].astype(str).str.strip()
    df['name'] = df['name'].astype(str).str.strip()
    df['brand'] = df['brand'].astype(str).str.strip()
    
    def clean_num(val):
        try:
            return float(str(val).replace('\xa0', '').replace(' ', '').replace(',', '.'))
        except:
            return 0.0

    df['price'] = df['price'].apply(clean_num)
    df['stock'] = df['stock'].apply(clean_num).astype(int)

    # Конвертируем в список словарей
    df = df.fillna('')
    data = df.to_dict(orient='records')
    
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Данные исправлены! Сохранено {len(data)} товаров в {OUTPUT_JSON}")
    return data

def enhance_images():
    print("\n--- 2. Улучшение качества изображений ---")
    if not os.path.exists(IMG_DIR):
        print("Папка с картинками не найдена.")
        return

    files = [f for f in os.listdir(IMG_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    print(f"Найдено картинок для обработки: {len(files)}")

    count = 0
    for filename in files:
        img_path = os.path.join(IMG_DIR, filename)
        try:
            with Image.open(img_path) as img:
                # 1. Увеличение резкости
                img = img.filter(ImageFilter.SHARPEN)
                
                # 2. Увеличение контрастности
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1.2) # +20% контраста
                
                # 3. Улучшение цветовой насыщенности
                color = ImageEnhance.Color(img)
                img = color.enhance(1.1)
                
                # Сохраняем обратно с максимальным качеством
                img.save(img_path, quality=95, optimize=True)
                
            count += 1
            if count % 500 == 0:
                print(f"Обработано: {count}...")
        except Exception as e:
            print(f"Ошибка в файле {filename}: {e}")

    print(f"Улучшение завершено! Обработано {count} файлов.")

if __name__ == "__main__":
    fix_encoding_and_data()
    enhance_images()
