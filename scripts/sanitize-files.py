import os
import re

IMG_DIR = "public/uploads/products"

def sanitize_filenames():
    print("--- ДЕЗИНФЕКЦИЯ ИМЕН ФАЙЛОВ ---")
    files = os.listdir(IMG_DIR)
    count = 0
    
    for filename in files:
        # Убираем все странные символы, оставляем только латиницу, цифры, точки и подчеркивания
        new_name = re.sub(r'[^a-zA-Z0-9\._-]', '_', filename)
        
        if new_name != filename:
            old_path = os.path.join(IMG_DIR, filename)
            new_path = os.path.join(IMG_DIR, new_name)
            
            # Если файл с таким именем уже есть, добавим суффикс
            if os.path.exists(new_path):
                name_part, ext = os.path.splitext(new_name)
                new_path = os.path.join(IMG_DIR, f"{name_part}_fix{ext}")
            
            try:
                os.rename(old_path, new_path)
                print(f"[RENAME] {filename} -> {os.path.basename(new_path)}")
                count++;
            except:
                pass
                
    print(f"Итого переименовано: {count}")

if __name__ == "__main__":
    sanitize_filenames()
