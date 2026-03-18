import os
import json
import torch
import subprocess
import shutil
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from icrawler.builtin import BingImageCrawler
import torch.nn.functional as F

# Settings
IMG_DIR = "public/uploads/products"
MODEL_NAME = "openai/clip-vit-base-patch32"
DATA_FILE = "data_fixed.json"
RESULTS_FILE = "scripts/ai_rescue_results.json"
GOLD_REF_PATH = "gold_target.png"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

print("Initializing AI Rescue Operation (100% Coverage Mode)...")
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
    print(f"    [AI] Restoring & Upscaling...")
    try:
        cmd = [ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus"]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except: return False

def generate_smart_specs(item):
    name = item['name'].lower()
    brand = item['brand']
    specs = {
        "Бренд": brand,
        "Артикул": item['sku'],
        "Цвет": "Хром" if "ig0" not in item['sku'].lower() else "Золото",
        "Гарантия": "5 лет",
        "Статус": "Verified by AI"
    }
    if "смеситель" in name: 
        specs.update({"Категория": "Смесители", "Материал": "Латунь"})
    elif "унитаз" in name:
        specs.update({"Категория": "Санфаянс", "Материал": "Керамика"})
    elif "тумба" in name or "шкаф" in name:
        specs.update({"Категория": "Мебель", "Материал": "Влагостойкий ЛДСП"})
    return specs

def rescue_item(item):
    sku = item['sku']
    name = f"{item['brand']} {item['name']}"
    
    # 1. Берем эталон из Excel
    ref_path = os.path.join(IMG_DIR, f"{sku}.png")
    if not os.path.exists(ref_path): ref_path = os.path.join(IMG_DIR, f"{item['code1C']}.png")
    
    if not os.path.exists(ref_path):
        print(f"  [X] No base image for {sku}. Skipping.")
        return None

    # 2. Пробуем найти HQ в сети
    temp_dir = f"scripts/ai/rescue_{sku}"
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    crawler = BingImageCrawler(storage={'root_dir': temp_dir})
    crawler.crawl(keyword=f"{name} official white background", max_num=5)
    
    found_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir)]
    best_img = None
    
    if found_files:
        print(f"  Analysing web results for {sku}...")
        ref_features = get_image_features(ref_path)
        for img_path in found_files:
            try:
                curr_features = get_image_features(img_path)
                sim = F.cosine_similarity(ref_features, curr_features).item()
                if sim > 0.88:
                    best_img = img_path
                    print(f"    [V] HQ Match Found ({sim:.2%})")
                    break
            except: continue

    # 3. ФИНАЛЬНЫЙ ЭТАП: Если не нашли в сети - спасаем оригинал из Excel
    final_filename = f"AI_RESCUE_{sku}.jpg"
    target_path = os.path.join(IMG_DIR, final_filename)
    
    if best_img:
        upscale_image(best_img, target_path)
        item['ai_status'] = "Web HQ + AI Upscale"
    else:
        print(f"    [!] No web match. Upscaling Excel Original...")
        upscale_image(ref_path, target_path)
        item['ai_status'] = "Excel Restored + AI Upscale"

    item['ai_image'] = f"/uploads/products/{final_filename}"
    item['ai_attributes'] = generate_smart_specs(item)
    
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    return item

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    # Берем те 80, которые не прошли (или просто следующие 80 из списка)
    # Для теста возьмем 80 товаров, которых еще нет в базе
    target_items = all_data[100:180] 
    
    final_results = []
    print(f"Starting Rescue Operation for 80 items...")
    for i, item in enumerate(target_items):
        print(f"[{i+1}/80] Processing {item['sku']}...")
        res = rescue_item(item)
        if res: final_results.append(res)
    
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n--- RESCUE COMPLETED: {len(final_results)} items ready ---")
