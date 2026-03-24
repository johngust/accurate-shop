import os
import json
import torch
import subprocess
import shutil
import re
import time
import uuid
import requests
from bs4 import BeautifulSoup
from PIL import Image
import sqlite3

# Настройки
IMG_DIR = "public/uploads/products"
DATA_FILE = "data_fixed.json"
DB_PATH = "prisma/dev.db"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"
ASSETS_INDEX_FILE = "scripts/local_assets_index.json"
CATEGORIES_FILE = "scripts/categories_full.json"
PLACEHOLDER_IMG = "/uploads/products/placeholder.png"
MAIN_SITE = "https://vsedlyavanny.kz"

print("--- AI ULTRA IMPORT V24: THE HD SNIPER (FINAL) ---")

os.makedirs(IMG_DIR, exist_ok=True)

with open(ASSETS_INDEX_FILE, 'r', encoding='utf-8') as f: LOCAL_ASSETS = json.load(f)
with open(CATEGORIES_FILE, 'r', encoding='utf-8') as f: CATEGORIES_TREE = json.load(f)

def db_execute(query, params=()):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(query, params)
    res = cursor.fetchall()
    conn.commit(); conn.close()
    return res

def get_img_resolution(path):
    try:
        with Image.open(path) as img: return img.size
    except: return (0, 0)

def upscale_hd(input_path, output_path):
    try:
        subprocess.run([ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus", "-s", "4"], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
        return os.path.exists(output_path)
    except: return False

def hunt_site_hd(sku):
    try:
        search_url = f"{MAIN_SITE}/search/?query={sku}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        r = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(r.text, 'html.parser')
        link = soup.select_one('.product-item-title a')
        if not link: return None
        
        detail_url = MAIN_SITE + link['href']
        r_det = requests.get(detail_url, headers=headers, timeout=10)
        soup_det = BeautifulSoup(r_det.text, 'html.parser')
        
        img_container = soup_det.select_one('.product-item-detail-slider-image') or \
                        soup_det.select_one('.product-main-image')
        
        target_img = None
        if img_container:
            parent_link = img_container.find_parent('a')
            if parent_link and parent_link.get('href'):
                target_img = parent_link['href']
            else:
                img_tag = img_container.select_one('img')
                if img_tag: target_img = img_tag.get('data-src') or img_tag.get('src')

        if target_img:
            if target_img.startswith('/'): target_img = MAIN_SITE + target_img
            tmp = f"scripts/ai/hd_tmp_{sku}.jpg"
            img_data = requests.get(target_img, timeout=20).content
            with open(tmp, 'wb') as f: f.write(img_data)
            w, h = get_img_resolution(tmp)
            if w > 400: return tmp
            else: os.remove(tmp)
    except: pass
    return None

def get_best_category(name):
    name_low = name.lower()
    rules = [
        (["стойка", "гарнитур", "панель душевая", "душевая лейка"], "6b22a2e1-5966-4c77-bf2b-a782a97b7e28"),
        (["поддон", "экраны"], "b29613d1-0c89-4f88-a383-5afa70b1e492"),
        (["зеркало", "зеркальный", "шкаф", "пенал"], "5f6afd75-554a-42a7-bd6e-64d636b6b0cb"),
        (["инсталляция", "рама"], "df9e9213-6f9d-4e16-a583-4bb7acbb56d1"),
    ]
    for keywords, cat_id in rules:
        if any(k in name_low for k in keywords): return cat_id
    
    cat_names = {c['id']: c['name'].lower() for c in CATEGORIES_TREE}
    for cid, cname in cat_names.items():
        if cname[:-1] in name_low: return cid
    return "ae2b4b15-e757-4b02-8675-51c5d047b2f3"

def process_item(item):
    sku = str(item['sku']).strip()
    name = item['name']
    brand = item['brand']
    safe_sku = re.sub(r'[^a-zA-Z0-9_\-]', '_', sku)
    
    source_path = None
    source_info = "NONE"

    # 1. SITE HD
    if len(sku) > 3:
        source_path = hunt_site_hd(sku)
        if source_path: source_info = "SITE_HD"

    # 2. LOCAL INDEX
    if not source_path and sku in LOCAL_ASSETS:
        source_path = LOCAL_ASSETS[sku]
        w, h = get_img_resolution(source_path)
        if w < 600:
            print(f"    [AI] Upscaling {sku}...")
            tmp_up = os.path.join(IMG_DIR, f"V24_UP_{safe_sku}.jpg")
            if upscale_hd(source_path, tmp_up):
                source_path = tmp_up
                source_info = "LOCAL_UPSCALED"
        else: source_info = "LOCAL_HD"

    final_url = PLACEHOLDER_IMG
    if source_path:
        final_filename = f"V24_{safe_sku}.jpg"
        target_path = os.path.join(IMG_DIR, final_filename)
        try:
            with Image.open(source_path) as img:
                img.convert("RGB").save(target_path, "JPEG", quality=95)
            final_url = f"/uploads/products/{final_filename}"
            print(f"  [OK] {sku} from {source_info}")
        except: pass

    if source_path and "hd_tmp_" in source_path: os.remove(source_path)

    # DB SAVE
    p_id = str(uuid.uuid4())
    db_execute("INSERT OR IGNORE INTO Brand (id, name, slug) VALUES (?,?,?)", (str(uuid.uuid4()), brand, brand.lower()))
    brand_id = db_execute("SELECT id FROM Brand WHERE name = ?", (brand,))[0][0]
    cat_id = get_best_category(name)
    
    try: raw_p = item.get('price', 0); valid_price = float(str(raw_p).replace(',', '.'))
    except: valid_price = 0.0

    db_execute("INSERT INTO Product (id, name, slug, description, brandId, categoryId, attributes) VALUES (?,?,?,?,?,?,?)",
               (p_id, name, f"{safe_sku.lower()}-{p_id[:4]}", f"HD Продукт {brand}. Артикул {sku}.", brand_id, cat_id, json.dumps({"Source": source_info})))
    db_execute("INSERT OR REPLACE INTO ProductVariant (id, productId, sku, price, stock, options) VALUES (?,?,?,?,?,?)",
               (str(uuid.uuid4()), p_id, sku, valid_price, item.get('stock', 0), json.dumps({"type": "Original"})))
    db_execute("INSERT INTO Media (id, productId, url, type, isPrimary) VALUES (?,?,?,?,?)",
               (str(uuid.uuid4()), p_id, final_url, 'IMAGE', 1))
    db_execute("UPDATE ImportStatus SET success = success + 1, lastSku = ? WHERE id = 'active'", (sku,))

if __name__ == "__main__":
    db_execute("DELETE FROM ImportStatus WHERE id='active'")
    db_execute("INSERT INTO ImportStatus (id, success, errors, reviews, noImageCount, misplacedCount) VALUES ('active', 0, 0, 0, 0, 0)")
    with open(DATA_FILE, 'r', encoding='utf-8') as f: data = json.load(f)
    print("Starting V24 HD Snipping...")
    # Начинаем с 1000-го товара для разнообразия
    for item in data[1000:1100]:
        process_item(item)
    print("Done. Check Monitor.")
