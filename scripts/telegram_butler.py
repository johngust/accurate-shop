import os
import sqlite3
import subprocess
import asyncio
from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

TOKEN = "8786538320:AAEXTAGK8lrAKZAOfDYjdt9BBVUQvps3QMI"
DB_PATH = "prisma/dev.db"
REPORT_PATH = "scripts/import_reports.txt"

# Кнопки управления
MENU_KBD = [['/status', '/questions'], ['/view_reports', '/stop_import']]

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 Я твой ИИ-Дворецкий Accurate. Управляй магазином с телефона!",
        reply_markup=ReplyKeyboardMarkup(MENU_KBD, resize_keyboard=True)
    )

async def status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT success, errors, reviews, lastSku, noImageCount, misplacedCount FROM ImportStatus WHERE id='active'")
    row = cursor.fetchone()
    
    cursor.execute("SELECT COUNT(*) FROM Product")
    total_db = cursor.fetchone()[0]
    conn.close()

    # Считаем ошибки и вопросы из лога
    error_count = 0
    question_count = 0
    if os.path.exists(REPORT_PATH):
        with open(REPORT_PATH, "r", encoding="utf-8") as f:
            content = f.read()
            error_count = content.count("[ERROR]")
            question_count = content.count("[QUESTION]")

    if row:
        success, errors, reviews, last_sku, no_img, mis_cat = row
        msg = (f"📊 СТАТУС ULTRA-ИМПОРТА (8000):\n"
               f"✅ Успешно (с фото): {success - no_img}\n"
               f"🖼️ Без изображения: {no_img}\n"
               f"📂 Не в ту категорию: {mis_cat}\n"
               f"❌ Ошибки (БД): {errors}\n"
               f"📦 Всего в базе: {total_db}\n"
               f"🔍 Последний SKU: {last_sku}")
    else:
        msg = "Статус не найден в базе."
    
    await update.message.reply_text(msg)

async def questions(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not os.path.exists(REPORT_PATH):
        await update.message.reply_text("Вопросов пока нет.")
        return

    qs = []
    with open(REPORT_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if "[QUESTION]" in line:
                qs.append(line.replace("[QUESTION]", "").strip())

    if not qs:
        await update.message.reply_text("✅ Пока никаких вопросов нет, все идет гладко!")
    else:
        # Берем последние 15
        latest_qs = qs[-15:]
        msg = "🤔 ВОПРОСЫ КО МНЕ (Последние 15):\n\n" + "\n\n".join([f"🔹 {q}" for q in latest_qs])
        if len(qs) > 15:
            msg += f"\n\n...и еще {len(qs)-15} вопросов в полном отчете (/view_reports)"
        await update.message.reply_text(msg)

async def start_ultra(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🚀 Запускаю ULTRA-выгрузку на 8000 товаров...")
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write("--- НАЧАЛО НОВОЙ ВЫГРУЗКИ ---\n")
    
    with open(REPORT_PATH, "a", encoding="utf-8") as f:
        subprocess.Popen(["python", "scripts/ULTRA_IMPORT_8000.py"], stdout=f, stderr=f)

async def stop_import(update: Update, context: ContextTypes.DEFAULT_TYPE):
    subprocess.run(["taskkill", "/F", "/IM", "python.exe", "/T"])
    await update.message.reply_text("🛑 Все процессы импорта принудительно остановлены.")

async def view_reports(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if os.path.exists(REPORT_PATH):
        await update.message.reply_document(document=open(REPORT_PATH, 'rb'))
    else:
        await update.message.reply_text("Файл отчета еще не создан.")

if __name__ == '__main__':
    app = ApplicationBuilder().token(TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("status", status))
    app.add_handler(CommandHandler("questions", questions))
    app.add_handler(CommandHandler("start_ultra", start_ultra))
    app.add_handler(CommandHandler("stop_import", stop_import))
    app.add_handler(CommandHandler("view_reports", view_reports))
    
    print("Бот-Дворецкий (ULTRA + Questions) запущен...")
    app.run_polling()
