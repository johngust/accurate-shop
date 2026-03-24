import os
import json
import sqlite3
import uuid
import shutil

# Настройки
MANIFEST_FILE = "scripts/manifest.json"
DB_PATH = "prisma/dev.db"
FINAL_IMG_DIR = "public/uploads/products"
TEMP_DIR = "public/uploads/manifest_temp"

def db_execute(query, params=()):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(query, params)
    res = cursor.fetchall()
    conn.commit(); conn.close()
    return res

def get_category_id(label):
    # Маппинг названий на ID из вашей базы
    mapping = {
        "Смесители": "c7f9be2f-bdad-49a7-bb54-f865c8b2e1d8",
        "Ванны": "b29613d1-0c89-4f88-a383-5afa70b1e492",
        "Унитазы": "0553b7ef-07ad-4828-94fc-af24704308d2",
        "Душевые системы": "6b22a2e1-5966-4c77-bf2b-a782a97b7e28",
        "Мебель": "5f6afd75-554a-42a7-bd6e-64d636b6b0cb",
        "Аксессуары": "9c0ca050-0d57-4f62-bd73-c2a2967f8f6a",
        "Сантехника": "ae2b4b15-e757-4b02-8675-51c5d047b2f3" # Дефолт
    }
    return mapping.get(label, "ae2b4b15-e757-4b02-8675-51c5d047b2f3")

def commit():
    if not os.path.exists(MANIFEST_FILE):
        print("Manifest not found!")
        return

    with open(MANIFEST_FILE, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    print(f"Starting COMMIT of {len(manifest)} items...")
    
    # 1. Очистка старых данных перед финальным импортом
    db_execute("DELETE FROM ProductVariant")
    db_execute("DELETE FROM Media")
    db_execute("DELETE FROM Product")
    db_execute("DELETE FROM Brand")
    db_execute("UPDATE ImportStatus SET success=0, errors=0, noImageCount=0, misplacedCount=0 WHERE id='active'")

    success_count = 0
    no_img_count = 0

    for item in manifest:
        sku = item['sku']
        brand = item['brand']
        name = item['name']
        desc = item['description']
        cat_id = get_category_id(item['category'])
        best = item['best']
        raw = item['raw']

        # Обработка картинки
        final_img_url = "/uploads/products/placeholder.png"
        if best['src'] != "placeholder.png" and os.path.exists(best['src']):
            filename = f"FINAL_{sku}_{uuid.uuid4().hex[:4]}.jpg"
            target_path = os.path.join(FINAL_IMG_DIR, filename)
            shutil.copy(best['src'], target_path)
            final_img_url = f"/uploads/products/{filename}"
        else:
            no_img_count += 1

        # Сохранение бренда
        db_execute("INSERT OR IGNORE INTO Brand (id, name, slug) VALUES (?,?,?)", 
                   (str(uuid.uuid4()), brand, brand.lower().replace(" ", "-")))
        brand_id = db_execute("SELECT id FROM Brand WHERE name = ?", (brand,))[0][0]

        # Сохранение продукта
        p_id = str(uuid.uuid4())
        safe_slug = "".join([c for c in sku.lower() if c.isalnum()]) + "-" + p_id[:4]
        
        db_execute("INSERT INTO Product (id, name, slug, description, brandId, categoryId, attributes) VALUES (?,?,?,?,?,?,?)",
                   (p_id, name, safe_slug, desc, brand_id, cat_id, json.dumps({"Source": "Elite V30"})))

        # Вариант
        try:
            price = float(str(raw.get('price', 0)).replace(',', '.'))
        except: price = 0.0
        
        db_execute("INSERT OR REPLACE INTO ProductVariant (id, productId, sku, price, stock, options) VALUES (?,?,?,?,?,?)",
                   (str(uuid.uuid4()), p_id, sku, price, raw.get('stock', 0), json.dumps({"type": "Original"})))

        # Медиа
        db_execute("INSERT INTO Media (id, productId, url, type, isPrimary) VALUES (?,?,?,?,?)",
                   (str(uuid.uuid4()), p_id, final_img_url, 'IMAGE', 1))

        success_count += 1
        db_execute("UPDATE ImportStatus SET success = ?, noImageCount = ?, lastSku = ? WHERE id = 'active'", 
                   (success_count, no_img_count, sku))
        
        print(f"  [COMMITTED] {sku}")

    print(f"FINISH! {success_count} products live on site.")

if __name__ == "__main__":
    commit()
