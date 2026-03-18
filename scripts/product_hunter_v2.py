import requests
from bs4 import BeautifulSoup
import os
import json
import time

import urllib3
urllib3.disable_warnings()

class ProductHunter:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def hunt_grohe(self, sku):
        print(f"--- [GROHE] Охота за артикулом: {sku} ---")
        search_url = f"https://www.grohe.ru/ru_ru/search/?q={sku}"
        
        try:
            res = requests.get(search_url, headers=self.headers, timeout=15, verify=False)
            if res.status_code != 200:
                print(f"Ошибка доступа к сайту GROHE: {res.status_code}")
                return None

            soup = BeautifulSoup(res.text, 'html.parser')
            
            # 1. Ищем ссылку на карточку товара
            product_link = None
            for a in soup.find_all('a', href=True):
                if sku in a['href'] and '/ru_ru/' in a['href'] and 'search' not in a['href']:
                    product_link = a['href']
                    if not product_link.startswith('http'):
                        product_link = "https://www.grohe.ru" + product_link
                    break
            
            if not product_link:
                print("Товар не найден в результатах поиска.")
                return None

            print(f"Переходим в карточку: {product_link}")
            res = requests.get(product_link, headers=self.headers, timeout=15, verify=False)
            soup = BeautifulSoup(res.text, 'html.parser')

            # 2. Ищем Характеристики (обычно в блоке тех. данных)
            specs = {}
            spec_table = soup.find('div', class_='product-specifications') or soup.find('dl', class_='product-details__list')
            if spec_table:
                # Извлекаем все пары ключ-значение
                items = spec_table.find_all(['dt', 'dd', 'div'])
                # (Упрощенный сбор данных для примера)
                specs['full_specs'] = spec_table.get_text(strip=True, separator=' | ')

            # 3. Ищем самое большое изображение
            # В GROHE часто используются ссылки на медиа-серверы
            image_url = None
            img_tags = soup.find_all('img')
            for img in img_tags:
                src = img.get('src') or img.get('data-src')
                # Ищем по ключевым словам в URL
                if src and (sku in src or 'original' in src or 'product-detail' in src):
                    if src.startswith('//'): src = 'https:' + src
                    elif src.startswith('/'): src = "https://www.grohe.ru" + src
                    image_url = src
                    break

            desc_tag = soup.find('div', class_='product-description')
            return {
                "sku": sku,
                "url": product_link,
                "image_url": image_url,
                "description": desc_tag.get_text(strip=True) if desc_tag else "",
                "specs": specs
            }

        except Exception as e:
            print(f"Критическая ошибка: {e}")
            return None

if __name__ == "__main__":
    hunter = ProductHunter()
    # Тест на Grandera 27974IG0
    result = hunter.hunt_grohe("27974IG0")
    
    if result:
        print("\n--- РЕЗУЛЬТАТ ОХОТЫ ---")
        print(f"Найден URL: {result['url']}")
        print(f"Фото оригинала: {result['image_url']}")
        if result['image_url']:
            print("ПОПЫТКА СКАЧИВАНИЯ...")
            img_res = requests.get(result['image_url'])
            with open(f"public/uploads/products/ORIGINAL_{result['sku']}.png", 'wb') as f:
                f.write(img_res.content)
            print(f"Файл сохранен как ORIGINAL_{result['sku']}.png")
    else:
        print("Ничего не найдено.")
