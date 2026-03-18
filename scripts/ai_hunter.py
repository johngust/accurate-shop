from icrawler.builtin import GoogleImageCrawler, BingImageCrawler
import os
import shutil

def hunt_by_name(product_name, sku):
    print(f"--- [AI-HUNTER] Поиск фото для: {product_name} ---")
    
    storage_dir = f"scripts/ai/temp_{sku}"
    if os.path.exists(storage_dir):
        shutil.rmtree(storage_dir)
    os.makedirs(storage_dir)

    # 1. Поиск через Bing (он менее капризный, чем Google)
    bing_crawler = BingImageCrawler(storage=({'root_dir': storage_dir}))
    bing_crawler.crawl(keyword=product_name, max_num=1)

    # 2. Проверяем, скачалось ли что-то
    files = os.listdir(storage_dir)
    if files:
        # Берем первый скачанный файл
        src_path = os.path.join(storage_dir, files[0])
        ext = files[0].split('.')[-1]
        target_path = f"public/uploads/products/HQ_{sku}.{ext}"
        
        # Копируем в папку uploads
        shutil.copy(src_path, target_path)
        print(f"УСПЕХ! Оригинал найден и сохранен: {target_path}")
        
        # Чистим временную папку
        shutil.rmtree(storage_dir)
        return target_path
    else:
        print("Фото не найдено через AI-Hunter.")
        if os.path.exists(storage_dir):
            shutil.rmtree(storage_dir)
        return None

if __name__ == "__main__":
    # Тест на лейке
    name = "Верхний душ GROHE Grandera 210 27974IG0 золото"
    hunt_by_name(name, "27974IG0")
