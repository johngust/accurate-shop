import sqlite3

def update():
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    
    columns = [
        ("noImageCount", "INTEGER DEFAULT 0"),
        ("misplacedCount", "INTEGER DEFAULT 0")
    ]
    
    for col_name, col_type in columns:
        try:
            cursor.execute(f"ALTER TABLE ImportStatus ADD COLUMN {col_name} {col_type}")
            print(f"Column {col_name} added.")
        except sqlite3.OperationalError:
            print(f"Column {col_name} already exists.")
            
    conn.commit()
    conn.close()

if __name__ == "__main__":
    update()
