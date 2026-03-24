import os
import json
import torch
import subprocess
import shutil
import uuid
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from icrawler.builtin import BingImageCrawler
import torch.nn.functional as F
import sqlite3

# Настройки
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
DATA_FILE = "data_fixed.json"
DB_PATH = "prisma/dev.db"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

IDEAL_SKUS = [
    "23132000",      # Смеситель GROHE Eurocube
    "212901001",     # Ванна чугунная Roca Continental
    "3948500H",      # Унитаз GROHE Bau Ceramic
    "7327491000",    # Раковина Roca America (или Victoria)
    "23322001",      # Еще один смеситель
    "APZ8-850",      # Трап AlcaPlast
    "M70",           # Кнопка AlcaPlast
    "AP-W-19-9M-1",  # Душевое ограждение Appolo
    "106119",        # Тумба с раковиной
    "HB10825-8"      # Кухонный смеситель
]

print("--- СОЗДАНИЕ ЗОЛОТОЙ ВИТРИНЫ (10 ЭТАЛОНОВ) ---")

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
    subprocess.run([ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def find_cat(name):
    name = name.lower()
    cats = db_execute("SELECT id, name FROM Category WHERE parentId IS NOT NULL")
    for c_id, c_name in cats:
        if c_name.lower() in name: return c_id
    res = db_execute("SELECT id FROM Category LIMIT 1")
    return res[0][0] if res else None

def process_sku(sku, item):
    brand = item['brand']
    name = item['name']
    print(f"Охота на {brand} {sku}...")
    
    temp_dir = f"scripts/ai/ideal_{sku}"
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    crawler = BingImageCrawler(storage={'root_dir': temp_dir})
    crawler.crawl(keyword=f"{brand} {sku} official white background", max_num=5)
    
    files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir)]
    if not files: return
    
    # Берем первую картинку для теста (обычно официальные фото в топе)
    best_img = files[0]
    final_filename = f"IDEAL_{sku}.jpg"
    target_path = os.path.join(IMG_DIR, final_filename)
    
    upscale_image(best_img, target_path)
    
    # Вставка в БД
    p_id = str(uuid.uuid4())
    brand_res = db_execute("SELECT id FROM Brand WHERE name = ?", (brand,))
    brand_id = brand_res[0][0] if brand_res else None
    if not brand_id:
        brand_id = str(uuid.uuid4())
        db_execute("INSERT OR IGNORE INTO Brand (id, name, slug) VALUES (?,?,?)", (brand_id, brand, brand.lower()))
    
    cat_id = find_cat(name)
    specs = {
        "Бренд": brand,
        "Артикул": sku,
        "Материал": "Премиум латунь / Керамика",
        "Гарантия": "5-10 лет",
        "Коллекция": "Original Series"
    }
    
    db_execute("INSERT INTO Product (id, name, slug, description, brandId, categoryId, attributes) VALUES (?,?,?,?,?,?,?)",
               (p_id, name, f"ideal-{sku.lower()}", f"Эталонный товар {brand} {name}. Максимальное качество исполнения.", brand_id, cat_id, json.dumps(specs, ensure_ascii=False)))
    db_execute("INSERT INTO ProductVariant (id, productId, sku, price, stock, options) VALUES (?,?,?,?,?,?)",
               (str(uuid.uuid4()), p_id, sku, item['price'], item['stock'], '{}'))
    db_execute("INSERT INTO Media (id, productId, url, type, isPrimary) VALUES (?,?,?,?,?)",
               (str(uuid.uuid4()), p_id, f"/uploads/products/{final_filename}", 'IMAGE', 1))
    
    print(f"  [OK] {sku} загружен.")
    shutil.rmtree(temp_dir)

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    for sku in IDEAL_SKUS:
        match = next((d for d in data if d['sku'] == sku), None)
        if match: process_sku(sku, match)
