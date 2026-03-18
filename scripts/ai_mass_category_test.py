import os
import json
import torch
import re
import subprocess
import shutil
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from icrawler.builtin import BingImageCrawler
import torch.nn.functional as F

# Настройки
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
DATA_FILE = "data_fixed.json"
RESULTS_FILE = "scripts/ai_mass_test_results.json"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

# Пороги
SHAPE_THRESHOLD = 0.85
COLOR_THRESHOLD = 0.88

print("Загрузка ИИ-мозга V12 (Mass Category Test)...")
model = CLIPModel.from_pretrained(MODEL_NAME, use_safetensors=True)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def get_image_features(img_path):
    image = Image.open(img_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        vision_outputs = model.vision_model(**inputs)
        features = vision_outputs[1]
        return features / features.norm(dim=-1, keepdim=True)

def upscale_image(input_path, output_path):
    try:
        subprocess.run([ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except: return False

def generate_smart_specs(item, cat_name):
    specs = {
        "Бренд": item['brand'],
        "Артикул": item['sku'],
        "Категория": cat_name,
        "Гарантия": "5 лет (официальная)"
    }
    # Добавим логику определения материалов по названию (упрощенно)
    name = item['name'].lower()
    if "хром" in name: specs["Цвет"] = "Хром"
    elif "золот" in name: specs["Цвет"] = "Золото"
    elif "черн" in name: specs["Цвет"] = "Черный матовый"
    
    if "латунь" in name: specs["Материал"] = "Латунь"
    elif "керам" in name: specs["Материал"] = "Керамика"
    
    return specs

def process_item(item, target_cat_name):
    sku = item['sku']
    name = f"{item['brand']} {item['name']}"
    
    # Референс из Excel
    ref_path = os.path.join(IMG_DIR, f"{sku}.png")
    if not os.path.exists(ref_path): ref_path = os.path.join(IMG_DIR, f"{item['code1C']}.png")
    if not os.path.exists(ref_path): return None

    try: ref_features = get_image_features(ref_path)
    except: return None

    temp_dir = f"scripts/ai/mass_{sku}"
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    # Поиск
    crawler = BingImageCrawler(storage={'root_dir': temp_dir})
    crawler.crawl(keyword=f"{name} official photo", max_num=5)
    
    found_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir)]
    best_img = None
    
    for img_path in found_files:
        try:
            curr_features = get_image_features(img_path)
            sim = F.cosine_similarity(ref_features, curr_features).item()
            if sim > SHAPE_THRESHOLD:
                best_img = img_path
                break
        except: continue

    result = None
    if best_img:
        final_filename = f"AI_CAT_TEST_{sku}.jpg"
        target_path = os.path.join(IMG_DIR, final_filename)
        upscale_image(best_img, target_path)
        
        item['ai_image'] = f"/uploads/products/{final_filename}"
        item['ai_category'] = target_cat_name
        item['ai_attributes'] = generate_smart_specs(item, target_cat_name)
        result = item
    
    shutil.rmtree(temp_dir)
    return result

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        all_data = json.load(f)

    # Карта подкатегорий и их ключевых слов для поиска
    SEARCH_MAP = {
        "Для раковины": ["смеситель для раковины", "смеситель для умывальника"],
        "Для кухни": ["смеситель для кухни", "смеситель для мойки"],
        "Для ванны": ["смеситель для ванны"],
        "Душевые системы": ["душевая система", "душевая стойка"],
        "Унитазы напольные": ["унитаз напольный", "унитаз-компакт"],
        "Унитазы подвесные": ["унитаз подвесной"],
        "Тумбы с раковиной": ["тумба с раковиной", "тумба под раковину"],
        "Зеркала": ["зеркало для ванной"],
        "Душевые лотки": ["душевой лоток"],
        "Трапы": ["трап для душа"],
        "Сифоны": ["сифон"],
        "Держатели и крючки": ["крючок", "держатель для бумаги", "держатель полотенец"]
    }

    final_results = []
    print("Начинаю подбор 5 товаров для каждой подкатегории...")

    for cat_name, keywords in SEARCH_MAP.items():
        print(f"\n--- Категория: {cat_name} ---")
        # Ищем кандидатов в JSON
        candidates = [d for d in all_data if any(k in d['name'].lower() for k in keywords)]
        # Берем первые 5 уникальных
        to_process = candidates[:5]
        
        for i, item in enumerate(to_process):
            print(f"  [{i+1}/5] Обработка {item['sku']}...")
            res = process_item(item, cat_name)
            if res: final_results.append(res)

    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n--- МАССОВЫЙ ТЕСТ ЗАВЕРШЕН: {len(final_results)} товаров готово ---")
