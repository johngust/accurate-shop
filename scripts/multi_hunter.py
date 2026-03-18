import requests
from bs4 import BeautifulSoup
import os
import json
import time
import urllib3

urllib3.disable_warnings()

class MultiHunter:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def fetch_image(self, sku, brand):
        print(f"--- [HUNTER] Поиск фото для: {brand} {sku} ---")
        
        # Список сайтов-доноров (только для фото и характеристик)
        targets = [
            f"https://santehnika-online.ru/search/?q={sku}",
            f"https://www.vanna-vanna.ru/search/?q={sku}",
            f"https://rutush.ru/search/?q={sku}"
        ]

        for url in targets:
            try:
                print(f"Проверка ресурса: {url}")
                res = requests.get(url, headers=self.headers, timeout=10, verify=False)
                if res.status_code != 200: continue

                soup = BeautifulSoup(res.text, 'html.parser')
                
                # Ищем картинку, которая содержит артикул или является главной на странице
                # Логика поиска картинки зависит от сайта, но мы ищем самую большую
                img_url = None
                
                # Поиск на Santehnika-Online
                if "santehnika-online" in url:
                    img_tag = soup.find('img', class_='product-card__image') or soup.find('img', itemprop='image')
                    if img_tag:
                        img_url = img_tag.get('src') or img_tag.get('data-src')

                # Поиск на Vanna-Vanna
                elif "vanna-vanna" in url:
                    img_tag = soup.find('div', class_='product-image').find('img') if soup.find('div', class_='product-image') else None
                    if img_tag:
                        img_url = img_tag.get('src')

                if img_url:
                    if img_url.startswith('//'): img_url = 'https:' + img_url
                    elif img_url.startswith('/'): 
                        domain = url.split('/')[2]
                        img_url = f"https://{domain}{img_url}"
                    
                    print(f"НАЙДЕНО ФОТО: {img_url}")
                    return img_url

            except Exception as e:
                print(f"Ошибка на {url}: {e}")
                continue
        
        print("Фото не найдено на доступных ресурсах.")
        return None

    def download_hq(self, sku, brand):
        img_url = self.fetch_image(sku, brand)
        if img_url:
            try:
                res = requests.get(img_url, stream=True, verify=False)
                if res.status_code == 200:
                    ext = img_url.split('.')[-1].split('?')[0]
                    if len(ext) > 4: ext = 'jpg'
                    path = f"public/uploads/products/HQ_{sku}.{ext}"
                    with open(path, 'wb') as f:
                        f.write(res.content)
                    print(f"УСПЕХ: Сохранено в {path}")
                    return path
            except Exception as e:
                print(f"Ошибка скачивания: {e}")
        return None

if __name__ == "__main__":
    hunter = MultiHunter()
    # Тестируем на той самой лейке
    hunter.download_hq("27974IG0", "GROHE")
