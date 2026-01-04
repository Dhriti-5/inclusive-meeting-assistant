# Ora - AI Meeting Assistant Startup Script
# This script starts all services needed for Ora

Write-Host "🤖 Starting Ora AI Meeting Assistant..." -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB is running
Write-Host "📊 Checking MongoDB..." -ForegroundColor Yellow
$mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
if (-not $mongoProcess) {
    Write-Host "⚠️  MongoDB is not running. Please start MongoDB first." -ForegroundColor Red
    Write-Host "   Run: mongod --dbpath <your-data-path>" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ MongoDB is running" -ForegroundColor Green
Write-Host ""

# Start Backend Server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; python main.py"
Start-Sleep -Seconds 3

# Start Frontend Development Server
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🎨 Frontend (React + Vite)' -ForegroundColor Magenta; npm run dev"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Ora is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Services:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "📧 Don't forget to configure your .env file with:" -ForegroundColor Yellow
Write-Host "   - ORA_EMAIL (Gmail for receiving invites)" -ForegroundColor White
Write-Host "   - ORA_EMAIL_PASSWORD (Google App Password)" -ForegroundColor White
Write-Host "   - SECRET_KEY (JWT secret)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Open your browser and go to http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
Write-Host ""
Write-Host "🛑 Stopping services..." -ForegroundColor Red
Get-Process | Where-Object {$_.ProcessName -like "*python*" -and $_.MainWindowTitle -like "*Backend*"} | Stop-Process -Force
Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.MainWindowTitle -like "*Frontend*"} | Stop-Process -Force
Write-Host "✅ All services stopped" -ForegroundColor Green
