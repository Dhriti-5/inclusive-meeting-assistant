# Synapse AI - Complete System Startup Script
# This script starts both backend and bot engine

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " SYNAPSE AI - SYSTEM STARTUP" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if (-not ($currentDir.Path -like "*inclusive-meeting-assistant*")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Check Python installation
Write-Host "1. Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   [OK] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Step 2: Check Node.js installation
Write-Host "2. Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   [OK] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Step 3: Check backend .env
Write-Host "3. Checking backend configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "   [OK] Backend .env found" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Backend .env not found" -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "   [INFO] Created backend\.env from example" -ForegroundColor Cyan
    }
}

# Step 4: Check bot engine .env
Write-Host "4. Checking bot engine configuration..." -ForegroundColor Yellow
if (Test-Path "bot_engine\.env") {
    Write-Host "   [OK] Bot engine .env found" -ForegroundColor Green
} else {
    Write-Host "   [WARN] Bot engine .env not found" -ForegroundColor Yellow
    if (Test-Path "bot_engine\.env.example") {
        Copy-Item "bot_engine\.env.example" "bot_engine\.env"
        Write-Host "   [INFO] Created bot_engine\.env from example" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " STARTING SERVICES" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 5: Start Backend
Write-Host "5. Starting Backend (FastAPI)..." -ForegroundColor Yellow
Write-Host "   Opening new terminal for backend..." -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Backend...' -ForegroundColor Cyan; cd backend; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

Write-Host "   [OK] Backend started in new window" -ForegroundColor Green
Write-Host "   Waiting 5 seconds for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Step 6: Start Bot Engine  
Write-Host "6. Starting Bot Engine (Node.js)..." -ForegroundColor Yellow
Write-Host "   Opening new terminal for bot engine..." -ForegroundColor Gray

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting Bot Engine...' -ForegroundColor Cyan; cd bot_engine; npm start"

Write-Host "   [OK] Bot engine started in new window" -ForegroundColor Green

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host " SYSTEM STARTUP COMPLETE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor Cyan
Write-Host "  - Backend:    http://localhost:8000" -ForegroundColor White
Write-Host "  - API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Bot Engine: Running in separate window" -ForegroundColor White
Write-Host ""
Write-Host "To stop services:" -ForegroundColor Yellow
Write-Host "  Press Ctrl+C in each terminal window" -ForegroundColor White
Write-Host ""

# Optional - Open browser to API docs
$openBrowser = Read-Host "Open API documentation in browser? (y/n)"
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:8000/docs"
    Write-Host "[OK] Browser opened" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit this startup script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
