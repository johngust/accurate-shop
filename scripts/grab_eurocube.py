from icrawler.builtin import BingImageCrawler
import os
import shutil

def grab_eurocube():
    sku = "23132000"
    name = "GROHE Eurocube 23132000 official photo"
    temp_dir = f"scripts/ai/temp_{sku}"
    
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)

    print(f"ИИ-Захват фото для {sku}...")
    crawler = BingImageCrawler(storage={'root_dir': temp_dir})
    crawler.crawl(keyword=name, max_num=1)

    files = os.listdir(temp_dir)
    if files:
        target_path = f"public/uploads/products/AI_FIXED_{sku}.jpg"
        shutil.copy(os.path.join(temp_dir, files[0]), target_path)
        print(f"УСПЕХ: Фото сохранено как {target_path}")
        return target_path
    return None

if __name__ == "__main__":
    grab_eurocube()
