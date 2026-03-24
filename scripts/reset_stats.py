import sqlite3
DB_PATH = "prisma/dev.db"
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("UPDATE ImportStatus SET success=0, errors=0, reviews=0, lastSku='START' WHERE id='active'")
conn.commit()
conn.close()
print("Stats reset successfully")
