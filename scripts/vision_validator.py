import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import os

# Загружаем модель (она скачается один раз, около 600МБ)
model_name = "openai/clip-vit-base-patch32"
model = CLIPModel.from_pretrained(model_name, use_safetensors=True)
processor = CLIPProcessor.from_pretrained(model_name)

# Переносим на видеокарту для скорости
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def validate_color(image_path, target_color_labels):
    print(f"--- [VISION-AI] Анализ изображения: {image_path} ---")
    
    try:
        image = Image.open(image_path)
        
        # Готовим текстовые подсказки для ИИ
        inputs = processor(
            text=target_color_labels, 
            images=image, 
            return_tensors="pt", 
            padding=True
        ).to(device)

        # Прогоняем через нейросеть
        with torch.no_grad():
            outputs = model(**inputs)
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1) # Получаем вероятности

        # Формируем результат
        results = {}
        for i, label in enumerate(target_color_labels):
            results[label] = probs[0][i].item()
            print(f"Вероятность '{label}': {results[label]:.2%}")

        # Находим победителя
        best_match = max(results, key=results.get)
        print(f"ИИ считает, что это: {best_match.upper()}")
        return best_match, results

    except Exception as e:
        print(f"Ошибка анализа: {e}")
        return None, None

if __name__ == "__main__":
    # Тест на нашей скачанной картинке (которая хром, а должна быть золото)
    img = "public/uploads/products/HQ_27974IG0.jpg"
    labels = ["gold plumbing fixture", "chrome plumbing fixture", "black plumbing fixture"]
    
    if os.path.exists(img):
        validate_color(img, labels)
    else:
        print(f"Файл {img} не найден. Сначала запустите скачивание.")
