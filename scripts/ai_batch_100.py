import os
import json
import torch
import random
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
RESULTS_FILE = "scripts/ai_batch_100_results.json"
GOLD_REF_PATH = "gold_target.png"
ESRGAN_PATH = "scripts/ai/realesrgan-ncnn-vulkan.exe"

print("Initializing AI Intelligence V10 (Mass Importer + Specs Engine)...")
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
    try:
        cmd = [ESRGAN_PATH, "-i", input_path, "-o", output_path, "-n", "realesrgan-x4plus"]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True
    except: return False

def generate_smart_specs(item):
    """Inferred specifications based on name and context"""
    name = item['name'].lower()
    brand = item['brand']
    
    specs = {
        "Бренд": brand,
        "Артикул": item['sku'],
        "Цвет": "Хром" if "ig0" not in item['sku'].lower() else "Золото (Cool Sunrise)",
        "Гарантия": "5 лет"
    }

    # Furniture (MELAR example)
    if "тумба" in name or "шкаф" in name:
        specs["Категория"] = "Мебель для ванной"
        specs["Материал"] = "ЛДСП / Эмаль"
        specs["Сборка"] = "В сборе"
        if "80" in name: specs["Ширина, см"] = "80"
        elif "60" in name: specs["Ширина, см"] = "60"
    
    # Faucets
    elif "смеситель" in name:
        specs["Категория"] = "Смесители"
        specs["Материал"] = "Латунь"
        specs["Назначение"] = "Для раковины" if "раковин" in name else "Для кухни" if "кухн" in name else "Для ванны"
        specs["Покрытие"] = "PVD" if "ig0" in item['sku'].lower() else "StarLight"
    
    # Shower
    elif "душ" in name or "лейка" in name:
        specs["Категория"] = "Душевая программа"
        specs["Материал"] = "Пластик / Латунь"
        specs["Режимы"] = "3 режима" if "massage" in name else "1 режим"
    
    # Ceramics
    elif "унитаз" in name or "раковина" in name:
        specs["Категория"] = "Санфаянс"
        specs["Материал"] = "Керамика"
        specs["Тип"] = "Подвесной" if "подвес" in name else "Напольный"

    return specs

def process_item(item):
    sku = item['sku']
    name = f"{item['brand']} {item['name']}"
    is_gold = "IG0" in sku
    
    # Excel reference check
    ref_path = os.path.join(IMG_DIR, f"{sku}.png")
    if not os.path.exists(ref_path): ref_path = os.path.join(IMG_DIR, f"{item['code1C']}.png")
    if not os.path.exists(ref_path): return None
    ref_features = get_image_features(ref_path)

    temp_dir = f"scripts/ai/temp_{sku}"
    if os.path.exists(temp_dir): shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    query = f"{item['brand']} {sku} product white background"
    crawler = BingImageCrawler(storage={'root_dir': temp_dir})
    crawler.crawl(keyword=query, max_num=10)
    
    found_files = [os.path.join(temp_dir, f) for f in os.listdir(temp_dir)]
    best_img = None
    max_score = 0
    
    for img_path in found_files:
        try:
            curr_features = get_image_features(img_path)
            shape_sim = F.cosine_similarity(ref_features, curr_features).item()
            color_sim = F.cosine_similarity(GOLD_FEATURES, curr_features).item() if is_gold else 1.0

            if shape_sim > 0.85 and (not is_gold or color_sim > 0.88):
                if shape_sim + color_sim > max_score:
                    max_score = shape_sim + color_sim
                    best_img = img_path
        except: continue

    if best_img:
        final_filename = f"AI_BATCH_{sku}.jpg"
        target_path = os.path.join(IMG_DIR, final_filename)
        temp_final = os.path.join(temp_dir, "to_up.jpg")
        shutil.copy(best_img, temp_final)
        
        # AI Upscaling
        upscale_image(temp_final, target_path)
        item['ai_image'] = f"/uploads/products/{final_filename}"
        item['ai_attributes'] = generate_smart_specs(item)
        print(f"  [OK] {sku} processed.")
        shutil.rmtree(temp_dir)
        return item
    
    shutil.rmtree(temp_dir)
    return None

if __name__ == "__main__":
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    # 100 random items
    target_items = random.sample(all_data, 100)
    
    final_results = []
    print(f"Starting mass processing of 100 items on RTX 4060 Ti...")
    for i, item in enumerate(target_items):
        print(f"[{i+1}/100] Processing {item['sku']}...")
        res = process_item(item)
        if res: final_results.append(res)
    
    with open(RESULTS_FILE, "w", encoding="utf-8") as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)
    
    print(f"\n--- BATCH 100 COMPLETED: {len(final_results)} success ---")
