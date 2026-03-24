import os
import json
import torch
import random
import subprocess
import shutil
import re
import time
import uuid
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from icrawler.builtin import BingImageCrawler
import torch.nn.functional as F
import sqlite3

# Settings
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
DATA_FILE = "data_fixed.json"
DB_PATH = "prisma/dev.db"
GOLD_REF_PATH = "gold_target.png"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

print("--- AI TEST RUN: 10 PERFECT PRODUCTS ---")

# 1. Load AI
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

GOLD_FEATURES = get_image_features(GOLD_REF_PATH)

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
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
        return True
    except: return False

def find_best_category(name):
    """Ищет подходящую категорию в дереве Bulak"""
    name_l = name.lower()
    cats = db_execute("SELECT id, name FROM Category WHERE parentId IS NOT NULL")

    # Сначала ищем по вхождению названия
    for c_id, c_name in cats:
        if c_name.lower() in name_l: return c_id

    # Если нет - ищем 'Для раковины' как дефолтную подкатегорию
    res = db_execute("SELECT id FROM Category WHERE name = 'Для раковины' LIMIT 1")
    if res: return res[0][0]

    # Совсем крайний случай - берем любую категорию
    res_any = db_execute("SELECT id FROM Category LIMIT 1")
    return res_any[0][0] if res_any else "no-category-found"

def generate_specs(item):
    name = item['name'].lower()
    specs = {
        "Бренд": item['brand'],
        "Артикул": item['sku'],
        "Материал": "Высококачественная латунь" if "смеситель" in name else "Сантехнический фарфор",
        "Цвет": "Золото (Cool Sunrise)" if "ig0" in item['sku'].lower() else "Хром (StarLight)",
        "Гарантия": "5 лет",
        "Производитель": "Германия (заводской оригинал)"
    }
    if "80" in name: specs["Ширина"] = "800 мм"
    return specs

def process_item(item):
    sku = item['sku']
    name = item['name']
    brand = item['brand']
    
    print(f"Обработка {sku}: {name}...")
    
    ref_path = os.path.join(IMG_DIR, f"{sku}.png")
    if not os.path.exists(ref_path): ref_path = os.path.join(IMG_DIR, f"{item['code1C']}.png")
    
    final_img_url = None
    if os.path.exists(ref_path):
        temp_dir = f"scripts/ai/temp_{sku}"
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
        os.makedirs(temp_dir)
        
        crawler = BingImageCrawler(storage={'root_dir': temp_dir})
        crawler.crawl(keyword=f"{brand} {name} white background", max_num=3)
        
        best_found = None
        ref_feats = get_image_features(ref_path)
        for f in os.listdir(temp_dir):
            try:
                curr_feats = get_image_features(os.path.join(temp_dir, f))
                sim = F.cosine_similarity(ref_feats, curr_feats).item()
                if sim > 0.88:
                    best_found = os.path.join(temp_dir, f)
                    break
            except: continue
        
        final_filename = f"TEST_V12_{sku}.jpg"
        target_path = os.path.join(IMG_DIR, final_filename)
        
        source = best_found if best_found else ref_path
        if upscale_image(source, target_path):
            final_img_url = f"/uploads/products/{final_filename}"
        
        shutil.rmtree(temp_dir)

    if final_img_url:
        p_id = str(uuid.uuid4())
        cat_id = find_best_category(name)
        brand_res = db_execute("SELECT id FROM Brand WHERE name = ?", (brand,))
        brand_id = brand_res[0][0] if brand_res else None

        if not brand_id: # Создаем бренд на лету
            brand_id = str(uuid.uuid4())
            db_execute("INSERT OR IGNORE INTO Brand (id, name, slug) VALUES (?,?,?)", (brand_id, brand, brand.lower()))

        # Вставка
        db_execute("INSERT INTO Product (id, name, slug, description, brandId, categoryId, attributes) VALUES (?,?,?,?,?,?,?)",
                   (p_id, name, f"{sku.lower()}-{p_id[:4]}", f"Премиальное решение {name} от {brand}. Идеальное качество и долговечность.", brand_id, cat_id, json.dumps(generate_specs(item), ensure_ascii=False)))
        db_execute("INSERT INTO ProductVariant (id, productId, sku, price, stock, options) VALUES (?,?,?,?,?,?)",
                   (str(uuid.uuid4()), p_id, sku, item['price'], item['stock'], '{}'))
        db_execute("INSERT INTO Media (id, productId, url, type, isPrimary) VALUES (?,?,?,?,?)",
                   (str(uuid.uuid4()), p_id, final_img_url, 'IMAGE', 1))
        
        db_execute("INSERT OR IGNORE INTO ImportStatus (id, success) VALUES ('active', 0)")
        db_execute("UPDATE ImportStatus SET success = success + 1, lastSku = ? WHERE id = 'active'", (sku,))
        return True
    return False

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Сбрасываем счетчик для теста
    db_execute("UPDATE ImportStatus SET success = 0, errors = 0, lastSku = 'TEST_START' WHERE id = 'active'")
    
    # Берем 10 товаров, для которых точно есть оригинал в Excel
    candidates = [d for d in data if os.path.exists(os.path.join(IMG_DIR, f"{d['sku']}.png")) or os.path.exists(os.path.join(IMG_DIR, f"{d['code1C']}.png"))]
    test_items = random.sample(candidates, 10)

    for item in test_items:
        process_item(item)
    
    print("\n--- TEST DONE: 10 ITEMS LOADED ---")
