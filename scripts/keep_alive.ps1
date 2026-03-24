$ErrorActionPreference = "SilentlyContinue"

function Start-All {
    Write-Host "Запуск систем Accurate..."
    
    # 1. Бот
    if (!(Get-Process -Name "python" | Where-Object { $_.CommandLine -like "*telegram_butler*" })) {
        Start-Process python -ArgumentList "scripts/telegram_butler.py" -WindowStyle Hidden
    }

    # 2. Next.js
    if (!(Get-Process -Name "node" | Where-Object { $_.CommandLine -like "*next*" })) {
        Start-Process npx -ArgumentList "next dev --port 3000" -WindowStyle Hidden
    }

    # 3. Туннель (через запуск в отдельном окне, чтобы мы видели URL в логах)
    Start-Process npx -ArgumentList "cloudflared tunnel --url http://localhost:3000" -RedirectStandardOutput "tunnel.log" -WindowStyle Hidden
}

# Очистка старого
taskkill /F /IM cloudflared.exe /T
taskkill /F /IM node.exe /T
taskkill /F /IM python.exe /T

Start-All

Write-Host "Системы запущены. Ожидание генерации ссылки..."
Start-Sleep -Seconds 15
Get-Content tunnel.log | Select-String "trycloudflare.com"
