# setup.ps1 - Automated Setup Script for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Setting up Interactive CFG and PDA Learning Tool" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Python
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Error "Python is not installed or not in PATH. Please install Python 3.11+."
    exit 1
}
Write-Host "[✓] Python detected: $($pythonCmd.Source)" -ForegroundColor Green

# 2. Check Node & npm
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if (-not $nodeCmd -or -not $npmCmd) {
    Write-Error "Node.js or npm is not in PATH. Please install Node.js v18+."
    exit 1
}
Write-Host "[✓] Node detected: $($nodeCmd.Source)" -ForegroundColor Green
Write-Host "[✓] npm detected: $($npmCmd.Source)" -ForegroundColor Green

# 3. Create Backend Virtual Environment
Write-Host "`nSetting up Python backend environment..." -ForegroundColor Yellow
$backendDir = Join-Path $PSScriptRoot "..\backend"
$venvDir = Join-Path $backendDir "venv"

if (-not (Test-Path $venvDir)) {
    Write-Host "Creating Python virtual environment in $venvDir..."
    python -m venv $venvDir
}

$pipExe = Join-Path $venvDir "Scripts\pip.exe"
$reqFile = Join-Path $backendDir "requirements.txt"
Write-Host "Installing backend dependencies from requirements.txt..."
& $pipExe install -r $reqFile

# 4. Install Frontend Dependencies
Write-Host "`nSetting up React frontend environment..." -ForegroundColor Yellow
$frontendDir = Join-Path $PSScriptRoot "..\frontend"
Push-Location $frontendDir
npm install
Pop-Location

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " Setup Complete! Run .\scripts\run.ps1 to start the tool." -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
