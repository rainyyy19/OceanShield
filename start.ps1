# OceanShield AI - PowerShell Full-Stack Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  OceanShield AI - Full-Stack Launcher (PowerShell)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$RootPath = $PSScriptRoot
if (-not $RootPath) { $RootPath = Get-Location }

Write-Host "Starting FastAPI Backend on Port 8000..." -ForegroundColor Magenta
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$RootPath\backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting Next.js Frontend on Port 3000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$RootPath\frontend'; npm run dev"

Write-Host "`nOceanShield AI Services Launched:" -ForegroundColor Yellow
Write-Host "  - Backend Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "  - Frontend Operations:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
