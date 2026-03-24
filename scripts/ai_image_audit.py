import cv2
import os
import sqlite3
import json

# Настройки
IMG_DIR = "public"
DB_PATH = "prisma/dev.db"
THRESHOLD = 100.0 # Порог резкости. Ниже - "мыло".

def get_blur_score(image_path):
    try:
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Вычисляем дисперсию Лапласиана
        return cv2.Laplacian(gray, cv2.CV_64F).var()
    except Exception as e:
        return 0

def main():
    print("--- АУДИТ РЕЗКОСТИ ИЗОБРАЖЕНИЙ ---")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT productId, url FROM Media WHERE type = 'IMAGE'")
    media_items = cursor.fetchall()
    
    results = {
        "sharp": [],
        "blurry": [],
        "failed": []
    }
    
    for p_id, url in media_items:
        full_path = os.path.join(IMG_DIR, url.lstrip('/'))
        if not os.path.exists(full_path):
            results["failed"].append(url)
            continue
            
        score = get_blur_score(full_path)
        item = {"url": url, "score": score, "id": p_id}
        
        if score < THRESHOLD:
            results["blurry"].append(item)
        else:
            results["sharp"].append(item)
            
    print(f"Всего проверено: {len(media_items)}")
    print(f"Четкие: {len(results['sharp'])}")
    print(f"Размытые (нужен апскейл): {len(results['blurry'])}")
    
    with open("scripts/image_audit_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    conn.close()

if __name__ == "__main__":
    main()
