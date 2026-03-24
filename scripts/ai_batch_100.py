import os
import json
import torch
import subprocess
import shutil
import uuid
import re
import time
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from icrawler.builtin import BingImageCrawler
import torch.nn.functional as F
import sqlite3

# Config
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
DATA_FILE = "data_fixed.json"
DB_PATH = "prisma/dev.db"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

print("--- AI BATCH 100: FILLING THE STORE ---")

# 1. Load AI
model = CLIPModel.from_pretrained(MODEL_NAME, use_safetensors=True)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def db_execute(query, params=()):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(query, params)
    res = cursor.fetchall()
    conn.commit()
    conn.close()
    return res

def upscale_image(input_path, output_path):
    try:
        subprocess.run([ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus"], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=45)
        return True
    except: return False

def find_best_category(name):
    name_l = name.lower()
    # 1. Поиск по ключевым словам
    mapping = {
        "смеситель": "Для раковины",
        "ванна": "Акриловые",
        "унитаз": "Унитазы напольные",
        "раковина": "Раковины",
        "мойка": "Из нержавеющей стали",
        "душевая": "Душевые системы",
        "трап": "Трапы",
        "сифон": "Сифоны",
        "кнопка": "Кнопки смыва",
        "тумба": "Тумбы с раковиной"
    }
    
    for key, cat_name in mapping.items():
        if key in name_l:
            res = db_execute("SELECT id FROM Category WHERE name = ?", (cat_name,))
            if res: return res[0][0]

    # 2. Если ничего не подошло, берем вообще любую подкатегорию
    res_any = db_execute("SELECT id FROM Category WHERE parentId IS NOT NULL LIMIT 1")
    return res_any[0][0] if res_any else None

def generate_specs(item):
    name = item['name'].lower()
    specs = {
        "Бренд": item['brand'],
        "Артикул": item['sku'],
        "Материал": "Латунь / Нержавеющая сталь" if "смеситель" in name else "Премиум материалы",
        "Гарантия": "5 лет",
        "Цвет": "Хром"
    }
    if "ig0" in item['sku'].lower(): specs["Цвет"] = "Золото"
    return specs

def process_item(item):
    sku = item['sku']
    name = item['name']
    brand = item['brand']
    
    # Check if exists
    exists = db_execute("SELECT id FROM ProductVariant WHERE sku = ?", (sku,))
    if exists: return True

    ref_path = os.path.join(IMG_DIR, f"{sku}.png")
    if not os.path.exists(ref_path): ref_path = os.path.join(IMG_DIR, f"{item['code1C']}.png")
    if not os.path.exists(ref_path): return False

    try:
        ref_feats = get_features(ref_path)
        temp_dir = f"scripts/ai/batch_{sku}"
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
        os.makedirs(temp_dir)
        
        crawler = BingImageCrawler(storage={'root_dir': temp_dir})
        crawler.crawl(keyword=f"{brand} {name} official", max_num=3)
        
        best_img = None
        for f in os.listdir(temp_dir):
            try:
                curr_feats = get_features(os.path.join(temp_dir, f))
                sim = F.cosine_similarity(ref_feats, curr_feats).item()
                if sim > 0.78: # Снизили строгость
                    best_img = os.path.join(temp_dir, f)
                    break
            except: continue
        
        # Если в сети ничего не подошло - берем оригинал из экселя (ref_path)
        source = best_img if best_img else ref_path
        final_filename = f"BATCH_{sku}.jpg"
        target_path = os.path.join(IMG_DIR, final_filename)
        
        if upscale_image(source, target_path):
            p_id = str(uuid.uuid4())
            cat_id = find_best_category(name)
            
            # Upsert Brand
            db_execute("INSERT OR IGNORE INTO Brand (id, name, slug) VALUES (?,?,?)", (str(uuid.uuid4()), brand, brand.lower()))
            brand_id = db_execute("SELECT id FROM Brand WHERE name = ?", (brand,))[0][0]

            # DB Insert
            db_execute("INSERT INTO Product (id, name, slug, description, brandId, categoryId, attributes) VALUES (?,?,?,?,?,?,?)",
                       (p_id, name, f"item-{sku.lower()}-{str(uuid.uuid4())[:4]}", f"Премиальное качество {brand}", brand_id, cat_id, json.dumps(generate_specs(item), ensure_ascii=False)))
            db_execute("INSERT INTO ProductVariant (id, productId, sku, price, stock, options) VALUES (?,?,?,?,?,?)",
                       (str(uuid.uuid4()), p_id, sku, item['price'], item['stock'], '{}'))
            db_execute("INSERT INTO Media (id, productId, url, type, isPrimary) VALUES (?,?,?,?,?)",
                       (str(uuid.uuid4()), p_id, f"/uploads/products/{final_filename}", 'IMAGE', 1))
            
            db_execute("UPDATE ImportStatus SET success = success + 1, lastSku = ? WHERE id = 'active'", (sku,))
            return True
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    return False

def get_features(path):
    img = Image.open(path).convert("RGB")
    inputs = processor(images=img, return_tensors="pt").to(device)
    with torch.no_grad():
        out = model.vision_model(**inputs)
        f = out[1]
        return f / f.norm(dim=-1, keepdim=True)

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Simple distribution
    targets = ["смеситель", "ванна", "унитаз", "раковина", "мойка", "душевая", "сифон", "трап", "кнопка", "тумба"]
    to_process = []
    for t in targets:
        matches = [d for d in data if t in d['name'].lower()][:10]
        to_process.extend(matches)
    
    print(f"Total to process: {len(to_process)}")
    for item in to_process:
        process_item(item)
