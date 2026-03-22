param()

$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is required. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Set-Location backend
npm install --no-audit --no-fund --silent
Set-Location ..

Set-Location frontend
npm install --no-audit --no-fund --silent
Set-Location ..

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
}

Write-Host "Done." -ForegroundColor Green
