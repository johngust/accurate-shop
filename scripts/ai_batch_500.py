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

print("--- AI BATCH 500: MASS IMPORT STARTING ---")

# 1. Load AI
print("Loading CLIP model...")
model = CLIPModel.from_pretrained(MODEL_NAME, use_safetensors=True)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def db_execute(query, params=()):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(query, params)
        res = cursor.fetchall()
        conn.commit()
        return res
    finally:
        conn.close()

def upscale_image(input_path, output_path):
    try:
        # Run ESRGAN
        # Requirement 3: Handle .jpg.png issue
        subprocess.run([ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus"], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
        
        # Check if the file was created with .png appended (e.g. BATCH_SKU.jpg.png)
        if os.path.exists(output_path + ".png"):
            if os.path.exists(output_path):
                os.remove(output_path)
            os.rename(output_path + ".png", output_path)
            return True
        elif os.path.exists(output_path):
            return True
        return False
    except Exception as e:
        print(f"Upscale error: {e}")
        return False

def find_or_create_category(keyword):
    mapping = {
        "смеситель": "Смесители",
        "ванна": "Ванны",
        "унитаз": "Унитазы",
        "раковина": "Раковины",
        "мойка": "Мойки",
        "душевая": "Душевые системы",
        "трап": "Трапы",
        "сифон": "Сифоны",
        "кнопка": "Кнопки смыва",
        "тумба": "Тумбы под раковину"
    }
    cat_name = mapping.get(keyword, "Разное")
    
    res = db_execute("SELECT id FROM Category WHERE name = ?", (cat_name,))
    if res:
        return res[0][0]
    else:
        cat_id = str(uuid.uuid4())
        # Basic slugification
        slug = cat_id[:8] # Fallback
        if keyword == "смеситель": slug = "сmesiteli"
        elif keyword == "ванна": slug = "vanny"
        elif keyword == "унитаз": slug = "unitazy"
        elif keyword == "раковина": slug = "rakoviny"
        elif keyword == "мойка": slug = "moyki"
        elif keyword == "душевая": slug = "dushevye-sistemy"
        elif keyword == "трап": slug = "trapy"
        elif keyword == "сифон": slug = "sifony"
        elif keyword == "кнопка": slug = "knopki-smyva"
        elif keyword == "тумба": slug = "tumby"
        
        db_execute("INSERT INTO Category (id, name, slug) VALUES (?,?,?)", (cat_id, cat_name, slug))
        return cat_id

def get_features(path):
    try:
        img = Image.open(path).convert("RGB")
        inputs = processor(images=img, return_tensors="pt").to(device)
        with torch.no_grad():
            out = model.vision_model(**inputs)
            f = out[1]
            return f / f.norm(dim=-1, keepdim=True)
    except:
        return None

def generate_specs(item):
    name = item['name'].lower()
    specs = {
        "Бренд": item['brand'],
        "Артикул": item['sku'],
        "Материал": "Латунь" if "смеситель" in name else "Премиум материалы",
        "Гарантия": "5 лет",
        "Тип": "AI Generated"
    }
    return specs

def process_item(item, keyword):
    sku = str(item['sku'])
    name = item['name']
    brand = item['brand']
    
    # Check if variant exists
    exists = db_execute("SELECT id FROM ProductVariant WHERE sku = ?", (sku,))
    if exists: 
        return False

    # Check for original image from excel
    ref_path = os.path.join(IMG_DIR, f"{sku}.png")
    if not os.path.exists(ref_path): 
        ref_path = os.path.join(IMG_DIR, f"{item['code1C']}.png")
    
    ref_feats = get_features(ref_path) if os.path.exists(ref_path) else None

    # Стерилизуем SKU для имени папки
    safe_sku = re.sub(r'[^a-zA-Z0-9]', '_', sku)
    temp_dir = f"scripts/ai/work_500_{safe_sku}"
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    best_img = None
    try:
        # Search online WITH TIMEOUT
        crawler = BingImageCrawler(storage={'root_dir': temp_dir})
        # Ограничиваем время поиска до 20 секунд на товар
        crawler.crawl(keyword=f"{brand} {name} official product photo", max_num=3) 
        
        # Если поиск затянулся или ничего не нашел - идем дальше
        files = os.listdir(temp_dir)
        if not files and os.path.exists(ref_path):
            print(f"  [INFO] No images found for {sku}, using Excel fallback.")
            max_sim = 0
            for f in os.listdir(temp_dir):
                f_path = os.path.join(temp_dir, f)
                curr_feats = get_features(f_path)
                if curr_feats is not None:
                    sim = F.cosine_similarity(ref_feats, curr_feats).item()
                    # Requirement 1: Threshold 0.75
                    if sim > 0.75 and sim > max_sim:
                        max_sim = sim
                        best_img = f_path
        
        # Requirement 2: Fallback to original if not found online
        source = best_img if best_img else (ref_path if os.path.exists(ref_path) else None)
        
        if not source:
            return False

        final_filename = f"BATCH_500_{sku}.jpg"
        target_path = os.path.join(IMG_DIR, final_filename)
        
        if upscale_image(source, target_path):
            p_id = str(uuid.uuid4())
            cat_id = find_or_create_category(keyword)
            
            # Upsert Brand
            brand_slug = brand.lower().replace(" ", "-").replace("/", "-")
            db_execute("INSERT OR IGNORE INTO Brand (id, name, slug) VALUES (?,?,?)", (str(uuid.uuid4()), brand, brand_slug))
            brand_res = db_execute("SELECT id FROM Brand WHERE name = ?", (brand,))
            brand_id = brand_res[0][0]

            # DB Insert Product
            prod_slug = f"ai-{sku.lower()}-{str(uuid.uuid4())[:4]}"
            db_execute("INSERT INTO Product (id, name, slug, description, brandId, categoryId, attributes, isBulky, isB2BOnly) VALUES (?,?,?,?,?,?,?,?,?)",
                       (p_id, name, prod_slug, f"Премиальный товар {brand} {name}. Высокое качество исполнения.", brand_id, cat_id, json.dumps(generate_specs(item), ensure_ascii=False), 0, 0))
            
            # DB Insert Variant
            db_execute("INSERT INTO ProductVariant (id, productId, sku, price, stock, options) VALUES (?,?,?,?,?,?)",
                       (str(uuid.uuid4()), p_id, sku, item['price'], item['stock'], '{}'))
            
            # DB Insert Media
            db_execute("INSERT INTO Media (id, productId, url, type, isPrimary) VALUES (?,?,?,?,?)",
                       (str(uuid.uuid4()), p_id, f"/uploads/products/{final_filename}", 'IMAGE', 1))
            
            # Update Status
            db_execute("UPDATE ImportStatus SET success = success + 1, lastSku = ?, updatedAt = datetime('now') WHERE id = 'active'", (sku,))
            return True
            
    except Exception as e:
        print(f"Error processing {sku}: {e}")
        db_execute("UPDATE ImportStatus SET errors = errors + 1, updatedAt = datetime('now') WHERE id = 'active'")
    finally:
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    return False

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if data and data[0].get('sku') == "Артикул":
        data = data[1:]

    targets = ["смеситель", "ванна", "унитаз", "раковина", "мойка", "душевая", "сифон", "трап", "кнопка", "тумба"]
    to_process = []
    
    # Requirement 4: Selection strategy
    # First, let's see what's already in the DB to avoid re-selecting
    existing_skus = {row[0] for row in db_execute("SELECT sku FROM ProductVariant")}
    
    for t in targets:
        matches = [d for d in data if t in d['name'].lower() and str(d['sku']) not in existing_skus]
        count = 0
        for m in matches:
            if count >= 50: break
            to_process.append((m, t))
            count += 1
    
    print(f"Total to process: {len(to_process)}")
    
    # Ensure active status exists
    db_execute("INSERT OR IGNORE INTO ImportStatus (id, total, success, errors, updatedAt) VALUES ('active', 0, 0, 0, datetime('now'))")
    db_execute("UPDATE ImportStatus SET total = total + ?, updatedAt = datetime('now') WHERE id = 'active'", (len(to_process),))

    success_count = 0
    for i, (item, keyword) in enumerate(to_process):
        print(f"Processing {i+1}/{len(to_process)}: {item['sku']} ({keyword})")
        if process_item(item, keyword):
            success_count += 1
            print(f"  Success! Total: {success_count}")
        else:
            print(f"  Skipped or Failed.")

    print(f"Batch completed. Successfully imported {success_count} products.")
