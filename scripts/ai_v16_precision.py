import os
import torch
import subprocess
import shutil
import cv2
import numpy as np
from icrawler.builtin import BingImageCrawler
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch.nn.functional as F

# Настройки
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

def is_schematic(path):
    """
    Определяет, является ли изображение чертежом/схемой.
    Чертежи обычно имеют очень мало цветов и много резких тонких линий.
    """
    try:
        img = cv2.imread(path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 1. Проверка на количество белого (чертежи почти все белые)
        white_pixels = np.sum(gray > 250)
        total_pixels = gray.size
        white_ratio = white_pixels / total_pixels
        
        # 2. Проверка на края (Canny edge detection)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / total_pixels
        
        # Если картинка очень белая и при этом много тонких линий - это схема
        if white_ratio > 0.9 and edge_density > 0.01:
            return True
        return False
    except:
        return False

print("Загрузка ИИ-Хирурга V16 (Anti-Schematic)...")
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

def surgeon_v16():
    sku = "C0510"
    brand = "Ани Пласт"
    print(f"\n[V16] Охота на ФОТОГРАФИЮ {sku}...")
    
    temp_dir = f"scripts/ai/v16_{sku}"
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    # Ищем ФОТО, исключая схемы
    query = f"{brand} {sku} сифон фото на белом фоне -drawing -schematic -blueprint"
    crawler = BingImageCrawler(storage={'root_dir': temp_dir})
    crawler.crawl(keyword=query, max_num=15)
    
    # Ищем референс как .jpg (после синхронизации)
    ref_path = os.path.join(IMG_DIR, f"{sku}.jpg")
    if not os.path.exists(ref_path):
        print(f"  [ERROR] Референс {ref_path} не найден!")
        return
    ref_feats = get_features(ref_path)
    
    best_img = None
    best_sim = 0
    
    for f_name in os.listdir(temp_dir):
        f_path = os.path.join(temp_dir, f_name)
        
        # ПРОПУСКАЕМ СХЕМЫ
        if is_schematic(f_path):
            print(f"  [SKIP] {f_name} опознан как чертеж.")
            continue
            
        try:
            curr_feats = get_features(f_path)
            sim = F.cosine_similarity(ref_feats, curr_feats).item()
            
            if sim > 0.80 and sim > best_sim:
                best_sim = sim
                best_img = f_path
        except: continue
            
    if best_img:
        print(f"  [FOUND] Найдено реальное фото! Сходство: {best_sim:.4f}")
        target_path = os.path.join(IMG_DIR, f"{sku}.jpg")
        subprocess.run([ESRGAN_PATH, "-i", best_img, "-o", target_path, "-n", "realesrgan-x4plus"], 
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        if os.path.exists(target_path + ".png"):
            if os.path.exists(target_path): os.remove(target_path)
            os.rename(target_path + ".png", target_path)
    else:
        print("  [FAIL] Не удалось найти фото без признаков чертежа.")

if __name__ == "__main__":
    surgeon_v16()
