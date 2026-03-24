import sqlite3
def reset():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    # Удаляем все товары и связанные данные
    cursor.execute('DELETE FROM ProductVariant')
    cursor.execute('DELETE FROM Media')
    cursor.execute('DELETE FROM Product')
    cursor.execute('DELETE FROM Brand')
    # Сбрасываем статус монитора
    cursor.execute('DELETE FROM ImportStatus')
    cursor.execute("INSERT INTO ImportStatus (id, success, errors, reviews, noImageCount, misplacedCount, lastSku) VALUES ('active', 0, 0, 0, 0, 0, 'CLEAN')")
    conn.commit()
    conn.close()
    print('Monitor and Database fully cleared.')

if __name__ == "__main__": reset()
