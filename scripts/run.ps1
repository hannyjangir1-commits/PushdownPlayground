# run.ps1 - Start Full-Stack Application (Backend & Frontend)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Interactive CFG and PDA Learning Tool" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "..\backend"
$frontendDir = Join-Path $PSScriptRoot "..\frontend"
$pythonExe = Join-Path $backendDir "venv\Scripts\python.exe"
$uvicornExe = Join-Path $backendDir "venv\Scripts\uvicorn.exe"

# 1. Start FastAPI Backend on Port 8001
Write-Host "Starting FastAPI backend server on http://127.0.0.1:8001..." -ForegroundColor Yellow
$backendJob = Start-Process -FilePath $uvicornExe -ArgumentList "app.main:app --port 8001 --host 127.0.0.1" -WorkingDirectory $backendDir -PassThru

Start-Sleep -Seconds 2

# 2. Start Vite Frontend on Port 5173
Write-Host "Starting Vite frontend server on http://localhost:5173..." -ForegroundColor Yellow
$frontendJob = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $frontendDir -PassThru

Start-Sleep -Seconds 3

# 3. Open Browser
Write-Host "`nOpening application in default web browser..." -ForegroundColor Green
Start-Process "http://localhost:5173/"

Write-Host "`nApplication is running:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173/"
Write-Host "  Backend:  http://127.0.0.1:8001/"
Write-Host "  API Docs: http://127.0.0.1:8001/docs"
Write-Host "`nPress Ctrl+C or close the terminal windows to stop servers."
