import os
import subprocess
import shutil
import re
from icrawler.builtin import BingImageCrawler

IMG_DIR = "public/uploads/products"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

SKUS = ["C0510", "C1010", "C6155", "C6255", "WS0110", "D283CP-2-RUS", "F6111147C-A", "F6125183CP-A-RUS", "F6125183CP-A2-RUS"]

def upscale_hq(input_path, output_path):
    # Используем модель x4plus-anime для более четких краев сантехники
    subprocess.run([ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus-anime"], 
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def rescue_images():
    print("--- ОПЕРАЦИЯ: СПАСЕНИЕ ИЗОБРАЖЕНИЙ (ANTI-BLUR) ---")
    
    for sku in SKUS:
        print(f"Обработка {sku}...")
        
        # 1. Пытаемся найти ОЧЕНЬ качественное фото в сети (keyword: high resolution)
        temp_dir = f"scripts/ai/rescue_{sku}"
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
        os.makedirs(temp_dir)
        
        crawler = BingImageCrawler(storage={'root_dir': temp_dir})
        # Ищем именно КРУПНЫЕ изображения
        crawler.crawl(keyword=f"{sku} product photo high resolution", max_num=10)
        
        files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir)]
        best_source = None
        
        # Фильтруем по размеру (хотя бы > 50KB)
        for f in files:
            if os.path.getsize(f) > 50000: # 50KB
                best_source = f
                break
        
        # Если в сети нет ничего крупного, берем ОРИГИНАЛ из Excel (он у нас в IMG_DIR как SKU.png)
        ref_path = os.path.join(IMG_DIR, f"{sku}.png")
        if not best_source and os.path.exists(ref_path):
            print(f"  [INFO] Сетевые фото слишком малы, используем оригинал Excel для {sku}")
            best_source = ref_path
            
        if best_source:
            target_path = os.path.join(IMG_DIR, f"{sku}.jpg")
            # Делаем апскейл из лучшего источника
            upscale_hq(best_source, target_path)
            
            # Проверка двойного расширения (фикс бага)
            if os.path.exists(target_path + ".png"):
                if os.path.exists(target_path): os.remove(target_path)
                os.rename(target_path + ".png", target_path)
                
            print(f"  [OK] {sku} восстановлен. Новый размер: {os.path.getsize(target_path)} байт")
        
        shutil.rmtree(temp_dir)

if __name__ == "__main__":
    rescue_images()
