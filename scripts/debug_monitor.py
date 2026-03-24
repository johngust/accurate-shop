import sqlite3
import os

DB_PATH = "prisma/dev.db"

def check():
    if not os.path.exists(DB_PATH):
        print("База не найдена")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM ImportStatus")
        row = cursor.fetchone()
        print(f"Статус из базы: {row}")
        
        cursor.execute("SELECT COUNT(*) FROM Product")
        count = cursor.fetchone()[0]
        print(f"Всего товаров в Product: {count}")
    except Exception as e:
        print(f"Ошибка: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check()
