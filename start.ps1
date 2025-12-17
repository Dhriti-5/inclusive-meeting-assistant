# Quick Start Script for Inclusive Meeting Assistant
# This script starts both the backend and frontend servers

Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  Inclusive Meeting Assistant - Quick Start" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentPath = Get-Location
if (-not (Test-Path "backend\main.py")) {
    Write-Host "ERROR: Please run this script from the project root directory!" -ForegroundColor Red
    Write-Host "Current directory: $currentPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Project root directory confirmed" -ForegroundColor Green
Write-Host ""

# Step 1: Start Backend
Write-Host "[1/2] Starting Backend Server..." -ForegroundColor Cyan
Write-Host "      Port: 8000" -ForegroundColor Gray
Write-Host "      Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host ""

$env:SKIP_MODEL_PRELOAD = '1'
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$currentPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

Write-Host "✓ Backend server starting in new window..." -ForegroundColor Green
Write-Host "  (Wait 10-15 seconds for models to load)" -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 3

# Step 2: Start Frontend
Write-Host "[2/2] Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "      Port: 5173" -ForegroundColor Gray
Write-Host "      URL:  http://localhost:5173" -ForegroundColor Gray
Write-Host ""

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$currentPath\frontend'; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"

Write-Host "✓ Frontend server starting in new window..." -ForegroundColor Green
Write-Host ""

# Instructions
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Green
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Wait for both servers to start (10-15 seconds)" -ForegroundColor White
Write-Host "2. Open your browser to: http://localhost:5173" -ForegroundColor Cyan
Write-Host "3. Upload an audio file to test the integration" -ForegroundColor White
Write-Host ""
Write-Host "Backend API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "Frontend UI:      http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ Both servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this window (servers will keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
