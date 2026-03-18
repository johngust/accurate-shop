import requests
from bs4 import BeautifulSoup
from googlesearch import search
import time
import os

def hunt_product(sku, brand):
    query = f"{brand} {sku} официальный сайт характеристики"
    print(f"--- Поиск данных для: {brand} {sku} ---")
    
    # 1. Ищем ссылки в Google
    links = []
    try:
        for j in search(query, num_results=5, lang="ru"):
            links.append(j)
    except Exception as e:
        print(f"Ошибка поиска: {e}")
        return

    print(f"Найдено ссылок: {len(links)}")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    found_data = {
        "image_url": None,
        "description": "",
        "specs": {}
    }

    for link in links:
        print(f"Анализируем: {link}")
        try:
            res = requests.get(link, headers=headers, timeout=10)
            if res.status_code != 200: continue
            
            soup = BeautifulSoup(res.text, 'html.parser')
            
            # Ищем большие изображения (обычно в тегах img с атрибутами src или data-src)
            images = soup.find_all('img')
            for img in images:
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if src and (sku in src or "original" in src or "large" in src or "high" in src):
                    if src.startswith('//'): src = 'https:' + src
                    elif src.startswith('/'): src = link.split('/')[0] + '//' + link.split('/')[2] + src
                    found_data["image_url"] = src
                    print(f"Найдено потенциальное фото: {src}")
                    break
            
            # Поиск описания (ищем длинные блоки текста)
            paragraphs = soup.find_all(['p', 'div'], class_=lambda x: x and ('description' in x or 'text' in x))
            if paragraphs:
                found_data["description"] = paragraphs[0].get_text(strip=True)
            
            if found_data["image_url"]: break # Если нашли фото, останавливаемся на этом сайте
            
        except Exception as e:
            print(f"Ошибка при парсинге {link}: {e}")
            continue

    return found_data

if __name__ == "__main__":
    data = hunt_product("27974IG0", "GROHE")
    if data:
        print("\n--- ИТОГ ПОИСКА ---")
        print(f"Фото: {data['image_url']}")
        print(f"Описание: {data['description'][:200]}...")
