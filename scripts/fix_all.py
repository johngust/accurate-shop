import sqlite3

def fix():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # 1. Создаем дефолтный бренд если его нет
    cursor.execute('INSERT OR IGNORE INTO Brand (id, name, slug) VALUES ("default-brand", "Premium Brand", "premium-brand")')
    
    # 2. Привязываем все товары с битыми brandId к нему
    cursor.execute('UPDATE Product SET brandId = "default-brand" WHERE brandId NOT IN (SELECT id FROM Brand)')
    
    conn.commit()
    count = cursor.rowcount
    conn.close()
    print(f"Исправлено товаров: {count}")

if __name__ == "__main__":
    fix()
