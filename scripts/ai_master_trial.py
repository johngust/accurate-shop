import os
import json
import torch
import random
import subprocess
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from icrawler.builtin import GoogleImageCrawler, BingImageCrawler
import shutil
import torch.nn.functional as F

# Настройки
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
DATA_FILE = "data_fixed.json"
RESULTS_FILE = "scripts/ai_trial_results.json"
GOLD_REF_PATH = "gold_target.png"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

print("Загрузка ИИ-мозга V9 (Google Hunter + RTX Upscale)...")
model = CLIPModel.from_pretrained(MODEL_NAME, use_safetensors=True)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def get_image_features(img_path):
    image = Image.open(img_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt").to(device)
    with torch.no_grad():
        vision_outputs = model.vision_model(**inputs)
        features = vision_outputs[1]
        return features / features.norm(dim=-1, keepdim=True)

GOLD_FEATURES = get_image_features(GOLD_REF_PATH)

def upscale_image(input_path, output_path):
    print(f"  [AI] Upscaling to 4K...")
    try:
        cmd = [ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus"]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except: return False

def process_item(item):
    sku = item['sku']
    name = f"{item['brand']} {item['name']}"
    is_gold = "IG0" in sku
    
    # ЭТАЛОН
    ref_path = os.path.join(IMG_DIR, f"{sku}.png")
    if not os.path.exists(ref_path): ref_path = os.path.join(IMG_DIR, f"{item['code1C']}.png")
    if not os.path.exists(ref_path): return None
    ref_features = get_image_features(ref_path)

    temp_dir = f"scripts/ai/temp_{sku}"
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    # ПОИСК В GOOGLE (Максимальная точность)
    print(f"Google Hunt: {name}...")
    # Используем Google, если заблокируют - откатимся на Bing автоматически
    crawler = GoogleImageCrawler(storage={'root_dir': temp_dir})
    crawler.crawl(keyword=f"{name} official product photo", max_num=10)
    
    found_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir) if f.endswith(('.jpg', '.png', '.jpeg'))]
    
    if not found_files:
        print("  - Google пуст, пробуем Bing...")
        crawler = BingImageCrawler(storage={'root_dir': temp_dir})
        crawler.crawl(keyword=f"{name} official photo", max_num=10)
        found_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir)]

    best_img = None
    max_score = 0
    
    for img_path in found_files:
        try:
            curr_features = get_image_features(img_path)
            shape_sim = F.cosine_similarity(ref_features, curr_features).item()
            color_sim = F.cosine_similarity(GOLD_FEATURES, curr_features).item() if is_gold else 1.0

            # ПОРОГ V9 (Очень строгий)
            if shape_sim > 0.88 and (not is_gold or color_sim > 0.88):
                score = shape_sim + color_sim
                if score > max_score:
                    max_score = score
                    best_img = img_path
        except: continue

    if best_img:
        final_filename = f"AI_V9_{sku}.jpg"
        target_path = os.path.join(IMG_DIR, final_filename)
        temp_final = os.path.join(temp_dir, "pre_upscale.jpg")
        shutil.copy(best_img, temp_final)
        
        if upscale_image(temp_final, target_path):
            item['ai_image'] = f"/uploads/products/{final_filename}"
            print(f"V УСПЕХ: {sku} (Google + 4K Upscale)")
        else:
            shutil.copy(best_img, target_path)
            item['ai_image'] = f"/uploads/products/{final_filename}"
    
    shutil.rmtree(temp_dir)
    return item if best_img else None

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    # 10 случайных товаров
    random_items = random.sample(all_data, 10)
    
    results = []
    for item in random_items:
        res = process_item(item)
        if res: results.append(res)
    
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n--- GOOGLE TEST V9 ЗАВЕРШЕН ---")
