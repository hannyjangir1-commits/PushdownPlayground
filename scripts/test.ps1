# test.ps1 - Run Complete Test Suite
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Running Automated Test Suites" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "..\backend"
$frontendDir = Join-Path $PSScriptRoot "..\frontend"
$pytestExe = Join-Path $backendDir "venv\Scripts\pytest.exe"

# 1. Run Backend Pytest Suite
Write-Host "`n[1/2] Running Backend Unit & Algorithm Tests (Pytest)..." -ForegroundColor Yellow
Push-Location $backendDir
& $pytestExe tests -v
$backendStatus = $LASTEXITCODE
Pop-Location

# 2. Run Frontend Build / Type-Check
Write-Host "`n[2/2] Running Frontend Build & Type Validation..." -ForegroundColor Yellow
Push-Location $frontendDir
npm run build
$frontendStatus = $LASTEXITCODE
Pop-Location

Write-Host "`n==========================================================" -ForegroundColor Cyan
if ($backendStatus -eq 0 -and $frontendStatus -eq 0) {
    Write-Host " ALL TEST SUITES PASSED (100% SUCCESS) " -ForegroundColor Green
} else {
    Write-Host " SOME TESTS FAILED " -ForegroundColor Red
}
Write-Host "==========================================================" -ForegroundColor Cyan
