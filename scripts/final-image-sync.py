import os
import re
import sqlite3

IMG_DIR = "public/uploads/products"
DB_PATH = "prisma/dev.db"

def final_fix():
    print("--- ФИНАЛЬНАЯ СИНХРОНИЗАЦИЯ КАРТИНОК ---")
    files = os.listdir(IMG_DIR)
    
    # 1. Сначала переименовываем все файлы на диске в простой SKU.jpg
    # Мы ищем SKU в названии файла (обычно это цифры в конце или после префикса)
    for filename in files:
        # Пытаемся вытащить SKU (например из BATCH_500_23132000.jpg -> 23132000)
        match = re.search(r'(\d{5,}|[A-Z0-9-]{5,})', filename)
        if match:
            sku = match.group(1)
            old_path = os.path.join(IMG_DIR, filename)
            new_name = f"{sku}.jpg"
            new_path = os.path.join(IMG_DIR, new_name)
            
            if old_path != new_path:
                try:
                    if os.path.exists(new_path): os.remove(new_path)
                    os.rename(old_path, new_path)
                    print(f"Disk: {filename} -> {new_name}")
                except: pass

    # 2. Обновляем базу данных
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Получаем все товары и их SKU
    cursor.execute("""
        SELECT p.id, v.sku 
        FROM Product p 
        JOIN ProductVariant v ON p.id = v.productId
    """)
    products = cursor.fetchall()
    
    for p_id, sku in products:
        img_name = f"{sku}.jpg"
        if os.path.exists(os.path.join(IMG_DIR, img_name)):
            new_url = f"/uploads/products/{img_name}"
            cursor.execute("UPDATE Media SET url = ? WHERE productId = ?", (new_url, p_id))
            print(f"DB: Product {sku} -> {new_url}")
            
    conn.commit()
    conn.close()
    print("--- ГОТОВО! БАЗА И ДИСК СИНХРОНИЗИРОВАНЫ ---")

if __name__ == "__main__":
    final_fix()
