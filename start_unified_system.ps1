# Unified System Startup Script for Inclusive Meeting Assistant
Write-Host "Starting Inclusive Meeting Assistant - Unified System" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host "Step 1: Starting Backend on port 8000..." -ForegroundColor Yellow
$backendPath = Join-Path $scriptDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; python -m uvicorn main:app --reload --port 8000"
Write-Host "   Waiting for backend..." -ForegroundColor Gray
Start-Sleep -Seconds 8
Write-Host "   Backend started!" -ForegroundColor Green
Write-Host ""

# Start Frontend
Write-Host "Step 2: Starting Frontend on port 3000..." -ForegroundColor Yellow
$frontendPath = Join-Path $scriptDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
Write-Host "   Waiting for frontend..." -ForegroundColor Gray
Start-Sleep -Seconds 5
Write-Host "   Frontend started!" -ForegroundColor Green
Write-Host ""

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "System Started Successfully!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "To test Sign Language:" -ForegroundColor Yellow
Write-Host "  python sign_language/inference.py --meeting-id session_demo_1" -ForegroundColor White
Write-Host ""
