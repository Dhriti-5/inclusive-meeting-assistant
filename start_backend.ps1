# PowerShell script to start the backend server
# Ensures MongoDB is running and starts the FastAPI server

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  🚀 Starting Inclusive Meeting Assistant Backend" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "`n📊 Checking MongoDB status..." -ForegroundColor Yellow
$mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue

if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  MongoDB service not running!" -ForegroundColor Red
    Write-Host "   Starting MongoDB..." -ForegroundColor Yellow
    Start-Service MongoDB -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    $mongoService = Get-Service MongoDB -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq 'Running') {
        Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Could not start MongoDB. Please start it manually." -ForegroundColor Red
        Write-Host "   Run: Start-Service MongoDB" -ForegroundColor Yellow
        exit 1
    }
}

# Check if .env file exists
Write-Host "`n📝 Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Please create a .env file with required configuration" -ForegroundColor Yellow
    exit 1
}

# Navigate to backend directory and start server
Write-Host "`n🎯 Starting FastAPI server..." -ForegroundColor Yellow
Write-Host "   Server: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

cd backend
python start_server.py
