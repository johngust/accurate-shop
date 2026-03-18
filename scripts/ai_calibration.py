import os
import json
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch.nn.functional as F

# Настройки
TEST_DIR = "public/ai_training_test"
MODEL_NAME = "openai/clip-vit-base-patch32"

print("Загрузка ИИ для калибровки...")
model = CLIPModel.from_pretrained(MODEL_NAME, use_safetensors=True)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# Твои выборы (SKU: Номер варианта)
USER_CHOICES = {
    "23844003": 2,
    "27243001": 1,
    "23322001": 2, # берем чистый вариант без водяных знаков
    "3948500H": 1,
    "3924500H": 1,
    "40364001": 2
}

def analyze_choice(sku, variant_num):
    item_folder = os.path.join(TEST_DIR, sku)
    if not os.path.exists(item_folder): return None
    
    files = [f for f in os.listdir(item_folder) if f.startswith('000')]
    files.sort()
    
    if variant_num > len(files): return None
    chosen_img = os.path.join(item_folder, files[variant_num-1])
    orig_img = os.path.join(item_folder, "original.png")
    
    # Считаем CLIP-метрики
    image_chosen = Image.open(chosen_img).convert("RGB")
    image_orig = Image.open(orig_img).convert("RGB")
    
    inputs = processor(images=[image_chosen, image_orig], return_tensors="pt").to(device)
    with torch.no_grad():
        # Используем vision_model напрямую для получения pooler_output (тензор)
        vision_outputs = model.vision_model(**inputs)
        features = vision_outputs[1] # Это pooler_output
        features = features / features.norm(dim=-1, keepdim=True)
        
    similarity = F.cosine_similarity(features[0:1], features[1:2]).item()
    
    # Проверка на водяные знаки (через текст)
    text_labels = ["clean photo without text", "photo with watermark or website logo"]
    inputs_text = processor(text=text_labels, images=image_chosen, return_tensors="pt", padding=True).to(device)
    with torch.no_grad():
        outputs = model(**inputs_text)
        text_probs = outputs.logits_per_image.softmax(dim=1)
    
    return {
        "sku": sku,
        "similarity_to_excel": similarity,
        "clean_prob": text_probs[0][0].item(),
        "watermark_prob": text_probs[0][1].item()
    }

if __name__ == "__main__":
    results = []
    print("\n--- АНАЛИЗ ВЫБОРА ПОЛЬЗОВАТЕЛЯ ---")
    for sku, num in USER_CHOICES.items():
        res = analyze_choice(sku, num)
        if res:
            results.append(res)
            print(f"SKU {sku}: Сходство с Excel: {res['similarity_to_excel']:.2%}, Чистота: {res['clean_prob']:.2%}")

    # Считаем среднее сходство
    avg_sim = sum(r['similarity_to_excel'] for r in results) / len(results)
    print(f"\nРЕКОМЕНДУЕМЫЙ ПОРОГ СХОДСТВА (Threshold): {avg_sim:.4f}")
