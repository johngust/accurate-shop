import os
import json
import re
import requests
from bs4 import BeautifulSoup
from PIL import Image
import uuid
import shutil
import torch
import subprocess
from transformers import CLIPProcessor, CLIPModel
from icrawler.builtin import BingImageCrawler

# Настройки
DATA_FILE = "data_fixed.json"
ASSETS_INDEX_FILE = "scripts/local_assets_index.json"
MANIFEST_FILE = "scripts/manifest.json"
TEMP_DIR = "public/uploads/manifest_temp"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"
MODEL_NAME = "openai/clip-vit-base-patch32"

TARGET_BRANDS = ["GROHE", "LEMARK", "ROSSINKA", "HAIBA"]

os.makedirs(TEMP_DIR, exist_ok=True)

print("--- AI HARVESTER V30: THE FINAL POLISH ---")

device = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained(MODEL_NAME, use_safetensors=True).to(device)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)

with open(ASSETS_INDEX_FILE, 'r', encoding='utf-8') as f: LOCAL_ASSETS = json.load(f)

def generate_description(brand, name):
    brand_texts = {
        "GROHE": "Немецкое качество и инновационные технологии. Идеальный выбор для ценителей долговечности и современного дизайна.",
        "LEMARK": "Чешская надежность и стиль. Продукция проходит строгий контроль качества и адаптирована для эксплуатации в СНГ.",
        "ROSSINKA": "Разработано в России специально для жесткой воды. Сочетание доступной цены и высокой функциональности.",
        "HAIBA": "Проверенный временем бренд с использованием высококачественной латуни и современных картриджей."
    }
    base = brand_texts.get(brand.upper(), "Высококачественное изделие для вашей ванной комнаты.")
    return f"{name}. {base} Официальная гарантия и сервисное обслуживание."

def upscale_image(path, sku):
    """Качественное улучшение ИИ"""
    out_path = os.path.join(TEMP_DIR, f"final_hd_{sku}_{uuid.uuid4().hex[:4]}.jpg")
    try:
        subprocess.run([ESRGAN_PATH, "-i", path, "-o", out_path, "-n", "realesrgan-x4plus"], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=45)
        if os.path.exists(out_path): return out_path
    except: pass
    return path

def check_white_bg(img_path):
    try:
        with Image.open(img_path).convert("RGB") as img:
            w, h = img.size
            corners = [img.getpixel((5, 5)), img.getpixel((w-5, 5)), img.getpixel((5, h-5)), img.getpixel((w-5, h-5))]
            for c in corners:
                if sum(c)/3 < 240: return False # Чуть снизил порог для теней
            return True
    except: return False

def evaluate_images(img_paths, product_name):
    best_path, max_score = None, -1
    prompts = [f"studio photo of {product_name} white background", "technical drawing", "box", "small thumbnail"]
    for path in img_paths:
        try:
            if not check_white_bg(path): continue
            image = Image.open(path).convert("RGB")
            # Если донный клапан - он должен быть маленьким объектом в центре
            inputs = processor(text=prompts, images=image, return_tensors="pt", padding=True).to(device)
            with torch.no_grad():
                outputs = model(**inputs)
                score = outputs.logits_per_image.softmax(dim=1)[0][0].item()
                if score > max_score and score > 0.55:
                    max_score = score; best_path = path
        except: continue
    return best_path

def hunt_global(brand, name, sku):
    search_dir = os.path.join(TEMP_DIR, f"h_{uuid.uuid4().hex[:6]}")
    os.makedirs(search_dir, exist_ok=True)
    
    # Спец-запросы для клапанов
    if "клапан" in name.lower():
        query = f"{brand} {sku} pop-up waste drain click-clack studio white background"
    else:
        query = f"{brand} {name} {sku} isolated white background studio"
        
    crawler = BingImageCrawler(storage={'root_dir': search_dir})
    crawler.crawl(keyword=query, max_num=10)
    
    winner = evaluate_images([os.path.join(search_dir, f) for f in os.listdir(search_dir)], f"{brand} {name}")
    
    final_path = None
    if winner:
        # 1. Сначала копируем победителя во внешнюю временную папку
        safe_temp = os.path.join(TEMP_DIR, f"safe_{sku}_{uuid.uuid4().hex[:4]}.jpg")
        shutil.copy(winner, safe_temp)
        
        # 2. ПРИНУДИТЕЛЬНЫЙ АПСКЕЙЛ ДЛЯ КЛАПАНОВ или мелких фото
        if "клапан" in name.lower() or Image.open(safe_temp).size[0] < 800:
            final_path = upscale_image(safe_temp, sku)
            # Удаляем safe_temp если создался HD файл
            if final_path != safe_temp: os.remove(safe_temp)
        else:
            final_path = safe_temp
            
    # Теперь безопасно удаляем папку поиска
    shutil.rmtree(search_dir)
    return final_path

def harvest():
    with open(DATA_FILE, 'r', encoding='utf-8') as f: data = json.load(f)
    manifest = []
    
    filtered_data = [i for i in data if str(i.get('brand')).upper() in TARGET_BRANDS]
    print(f"POLISHING: Targeting {len(filtered_data)} items...")

    for item in filtered_data[:100]:
        sku, brand, name = str(item['sku']).strip(), item['brand'], item['name']
        print(f"  [POLISH] {brand} - {sku}...")
        
        source_path = None
        source_info = "NONE"
        
        # 1. Поиск
        if not source_path:
            source_path = hunt_global(brand, name, sku)
            if source_path: source_info = "GLOBAL_PRECISE_HD"

        if source_path:
            with Image.open(source_path) as img: w, h = img.size
            entry_best = {"src": source_path, "source": source_info, "info": {"w":w, "h":h}, "q": "EXCELLENT", "color": "#44ff44"}
        else:
            entry_best = {"src": "placeholder.png", "source": "REJECTED", "q": "NOT STUDIO", "color": "#ff4444", "info": {"w":0, "h":0}}
            
        manifest.append({
            "sku": sku, "name": name, "brand": brand, 
            "description": generate_description(brand, name),
            "category": "Аксессуары" if "клапан" in name.lower() else "Сантехника", 
            "best": entry_best,
            "raw": item
        })

    with open(MANIFEST_FILE, 'w', encoding='utf-8') as f: json.dump(manifest, f, indent=2, ensure_ascii=False)

if __name__ == "__main__": harvest()
