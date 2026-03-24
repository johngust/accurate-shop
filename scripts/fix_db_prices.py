import sqlite3

def fix():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    # Ищем записи, где цена не является числом
    cursor.execute("SELECT id, sku, price FROM ProductVariant")
    rows = cursor.fetchall()
    
    bad_count = 0
    for row in rows:
        p_id, sku, price = row
        try:
            # Пробуем конвертировать в float
            if price is None or str(price).strip() == "":
                raise ValueError
            float(price)
        except (ValueError, TypeError):
            # Если не число - сбрасываем в 0
            cursor.execute("UPDATE ProductVariant SET price = 0.0 WHERE id = ?", (p_id,))
            bad_count += 1
            if bad_count < 5:
                print(f"Fixed SKU {sku}: '{price}' -> 0.0")
    
    conn.commit()
    conn.close()
    print(f"Total fixed: {bad_count} records.")

if __name__ == "__main__": fix()
