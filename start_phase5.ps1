# Phase 5 - Complete Startup Script
# Starts MongoDB, Backend, and Frontend

Write-Host "🚀 Starting Inclusive Meeting Assistant with Phase 5 Sign Language Detection" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Set location to project root
Set-Location "C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant"

# Check if MongoDB is already running
$mongoProcess = Get-Process -Name mongod -ErrorAction SilentlyContinue
if ($mongoProcess) {
    Write-Host "✅ MongoDB is already running (PID: $($mongoProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "🔄 Starting MongoDB..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant'; mongod --dbpath ./data/db"
    Start-Sleep -Seconds 3
    Write-Host "✅ MongoDB started" -ForegroundColor Green
}

Write-Host ""

# Start Backend in new window
Write-Host "🔄 Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant'; python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
Write-Host "⏳ Waiting for backend to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host "✅ Backend should be running on http://localhost:8000" -ForegroundColor Green

Write-Host ""

# Start Frontend in new window  
Write-Host "🔄 Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant\frontend'; npm run dev"
Start-Sleep -Seconds 5
Write-Host "✅ Frontend should be running on http://localhost:3000" -ForegroundColor Green

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "🎉 All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "🖐️  Sign Language Feature:" -ForegroundColor Cyan
Write-Host "   1. Login to the app" -ForegroundColor White
Write-Host "   2. Click 'Sign Language' in the navbar" -ForegroundColor White
Write-Host "   3. Allow camera permissions" -ForegroundColor White
Write-Host "   4. Start signing!" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
