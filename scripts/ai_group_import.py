import os
import json
import torch
import re
import subprocess
import shutil
from transformers import CLIPProcessor, CLIPModel
from PIL import Image, ImageStat
from icrawler.builtin import BingImageCrawler
import torch.nn.functional as F

# Настройки
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
DATA_FILE = "data_fixed.json"
RESULTS_FILE = "scripts/ai_grouped_results.json"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

print("Загрузка ИИ-мозга V12 (Smart Classification)...")
model = CLIPModel.from_pretrained(MODEL_NAME, use_safetensors=True)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# --- КАРТА КАТЕГОРИЙ ДЛЯ ИИ ---
# Формат: { Название в базе: [ключевые слова для поиска в тексте и для ИИ-зрения] }
CATEGORY_TREE_MAP = {
    "Смесители-Для раковины": ["смеситель для раковины", "basin faucet"],
    "Смесители-Для кухни": ["смеситель для кухни", "kitchen faucet"],
    "Смесители-Для ванны": ["смеситель для ванны", "bath faucet"],
    "Душевая программа-Душевые системы": ["душевая система", "shower system"],
    "Душевая программа-Лейки и шланги": ["лейка", "шланг для душа", "hand shower"],
    "Санфаянс-Унитазы": ["унитаз", "wc bowl"],
    "Санфаянс-Инсталляции": ["инсталляция", "mounting frame"],
    "Мебель для ванной-Тумбы с раковиной": ["тумба", "vanity unit"],
    "Мебель для ванной-Зеркала": ["зеркало", "bathroom mirror"],
    "Водоотвод-Душевые лотки": ["лоток", "душевой желоб", "shower channel"],
    "Водоотвод-Сифоны": ["сифон", "trap for sink"],
    "Аксессуары-Держатели и крючки": ["крючок", "держатель", "towel hook"]
}

def get_sharpness(img_path):
    img = Image.open(img_path).convert('L')
    return ImageStat.Stat(img).stddev[0]

def upscale_image(input_path, output_path):
    try:
        subprocess.run([ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except: return False

def classify_item(name, img_path=None):
    """Определяет категорию по названию и (опционально) по фото"""
    name_lower = name.lower()
    
    # 1. Текстовый анализ
    for cat_path, keywords in CATEGORY_TREE_MAP.items():
        if any(k in name_lower for k in keywords):
            return cat_path

    # 2. ИИ-Зрение (если есть картинка)
    if img_path and os.path.exists(img_path):
        try:
            image = Image.open(img_path).convert("RGB")
            # Берем английские метки для CLIP
            labels = [k[1] for k in CATEGORY_TREE_MAP.values()]
            inputs = processor(text=labels, images=image, return_tensors="pt", padding=True).to(device)
            with torch.no_grad():
                outputs = model(**inputs)
                probs = outputs.logits_per_image.softmax(dim=1)
            
            best_idx = probs.argmax().item()
            return list(CATEGORY_TREE_MAP.keys())[best_idx]
        except: pass

    return "Сантехника" # Фоллбэк

def extract_size(name):
    match = re.search(r'(\d{2,4})\s*(?:мм|см|mm|cm|M|L|S)?', name)
    return match.group(0) if match else "Стандарт"

def process_grouped_items(items):
    base_item = items[0]
    sku = base_item['sku']
    name = base_item['name']
    
    # ЭТАЛОН
    ref_path = os.path.join(IMG_DIR, f"{sku}.png")
    if not os.path.exists(ref_path): ref_path = os.path.join(IMG_DIR, f"{base_item['code1C']}.png")
    
    # КАТЕГОРИЯ
    category = classify_item(name, ref_path if os.path.exists(ref_path) else None)
    print(f"Классификация: {name} -> {category}")

    # ПОИСК И АПСКЕЙЛ (упрощенно для теста)
    final_img = f"/uploads/products/{sku}.png" # По умолчанию
    if os.path.exists(ref_path):
        final_path = os.path.join(IMG_DIR, f"AI_V12_{sku}.jpg")
        if upscale_image(ref_path, final_path):
            final_img = f"/uploads/products/AI_V12_{sku}.jpg"

    group_data = {
        "name": re.sub(r'\d+', '', name).strip(),
        "brand": base_item['brand'],
        "image": final_img,
        "category": category,
        "variants": []
    }
    
    for i in items:
        group_data["variants"].append({
            "sku": i['sku'],
            "price": i['price'],
            "stock": i['stock'],
            "size": extract_size(i['name'])
        })
    return group_data

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    # Группировка
    grouped = {}
    for item in all_data[180:280]: # Отрабатываем следующую сотню
        clean_name = re.sub(r'\d+', '', item['name']).strip()
        key = f"{item['brand']}_{clean_name}"
        if key not in grouped: grouped[key] = []
        grouped[key].append(item)
    
    final_results = []
    for key, items in grouped.items():
        res = process_grouped_items(items)
        if res: final_results.append(res)
    
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)
    print("\n--- СМАРТ-ИМПОРТ V12 ЗАВЕРШЕН ---")
