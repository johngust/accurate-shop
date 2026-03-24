import sqlite3
DB_PATH = "prisma/dev.db"

def check():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM Product")
    products = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM Category")
    categories = cursor.fetchone()[0]
    
    cursor.execute("SELECT * FROM ImportStatus WHERE id='active'")
    status = cursor.fetchone()
    
    print(f"Products: {products}")
    print(f"Categories: {categories}")
    print(f"Import Status: {status}")
    
    conn.close()

if __name__ == "__main__":
    check()
