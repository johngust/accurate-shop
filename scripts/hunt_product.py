from icrawler.builtin import BingImageCrawler
import os
import shutil
import sys
import argparse

def hunt_product(sku, keyword):
    IMG_DIR = "public/uploads/products"
    temp_dir = f"scripts/ai/hunt_{sku}"
    
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)

    print(f"Охота на {sku} по запросу: {keyword}...")
    crawler = BingImageCrawler(storage={'root_dir': temp_dir})
    # Ищем именно фото на белом фоне, исключая чертежи
    full_query = f"{keyword} -drawing -schematic -blueprint photo white background"
    crawler.crawl(keyword=full_query, max_num=5)

    files = os.listdir(temp_dir)
    if files:
        # Берем самый большой файл (обычно это лучшее качество)
        best_file = max([os.path.join(temp_dir, f) for f in files], key=os.path.getsize)
        target_path = os.path.join(IMG_DIR, f"HUNTED_{sku}.jpg")
        shutil.copy(best_file, target_path)
        print(f"УСПЕХ: Фото сохранено как {target_path}")
        return target_path
    
    print("НЕ НАЙДЕНО")
    return None

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--sku", required=True)
    parser.add_argument("--keyword", required=True)
    args = parser.parse_args()
    hunt_product(args.sku, args.keyword)
