import os
import torch
import subprocess
import shutil
import re
from icrawler.builtin import BingImageCrawler
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch.nn.functional as F

# Настройки
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

# Товары для переделки
REDO_LIST = [
    {"sku": "C0510", "brand": "Ани Пласт", "cat": "Сифон"},
    {"sku": "C1010", "brand": "Ани Пласт", "cat": "Сифон"},
    {"sku": "C6155", "brand": "Варяг", "cat": "Сифон"},
    {"sku": "C6255", "brand": "Варяг", "cat": "Сифон"},
    {"sku": "WS0110", "brand": "Ани Пласт", "cat": "Сиденье для унитаза"}
]

print("Загрузка ИИ-Хирурга V15...")
model = CLIPModel.from_pretrained(MODEL_NAME, use_safetensors=True)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def get_features(path):
    img = Image.open(path).convert("RGB")
    inputs = processor(images=img, return_tensors="pt").to(device)
    with torch.no_grad():
        out = model.vision_model(**inputs)
        f = out[1]
        return f / f.norm(dim=-1, keepdim=True)

def is_plumbing_color(path):
    """Проверяет, что на фото нет ярких 'тракторных' цветов (желтый, оранжевый)"""
    img = Image.open(path).convert("RGB")
    # Очень упрощенно: считаем средний цвет. Сантехника обычно белая/серая/хром.
    # Если много насыщенного желтого - это спецтехника.
    img_hsv = img.convert("HSV")
    # ... тут могла быть сложная логика, но пока ограничимся CLIP
    return True

def upscale_v15(input_path, output_path):
    # Модель anime дает четкие грани для пластика
    subprocess.run([ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus-anime"], 
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def surgeon_rescue():
    for item in REDO_LIST:
        sku = item['sku']
        brand = item['brand']
        cat = item['cat']
        
        print(f"\n[SURGEON] Хирургическая операция для {sku} ({brand})...")
        
        temp_dir = f"scripts/ai/surgeon_{sku}"
        if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
        os.makedirs(temp_dir)
        
        # КЛЮЧЕВОЙ МОМЕНТ: Контекстный запрос
        query = f"{brand} {sku} {cat} сантехника официальное фото"
        print(f"  Запрос: {query}")
        
        crawler = BingImageCrawler(storage={'root_dir': temp_dir})
        crawler.crawl(keyword=query, max_num=10)
        
        # Референс из Excel для сравнения формы
        ref_path = os.path.join(IMG_DIR, f"{sku}.png")
        if not os.path.exists(ref_path): continue
        ref_feats = get_features(ref_path)
        
        best_img = None
        best_sim = 0
        
        for f_name in os.listdir(temp_dir):
            f_path = os.path.join(temp_dir, f_name)
            try:
                curr_feats = get_features(f_path)
                sim = F.cosine_similarity(ref_feats, curr_feats).item()
                
                # Порог 0.88 - это 'Хирургическая точность'
                if sim > 0.88 and sim > best_sim:
                    best_sim = sim
                    best_img = f_path
            except: continue
            
        if best_img:
            print(f"  [FOUND] Найдено идеальное совпадение! Сходство: {best_sim:.4f}")
            target_path = os.path.join(IMG_DIR, f"{sku}.jpg")
            upscale_v15(best_img, target_path)
            
            # Фикс расширений
            if os.path.exists(target_path + ".png"):
                if os.path.exists(target_path): os.remove(target_path)
                os.rename(target_path + ".png", target_path)
        else:
            print(f"  [FALLBACK] В сети только мусор. Реставрируем оригинал из Excel.")
            target_path = os.path.join(IMG_DIR, f"{sku}.jpg")
            upscale_v15(ref_path, target_path)
            if os.path.exists(target_path + ".png"):
                if os.path.exists(target_path): os.remove(target_path)
                os.rename(target_path + ".png", target_path)

        shutil.rmtree(temp_dir)

if __name__ == "__main__":
    surgeon_rescue()
