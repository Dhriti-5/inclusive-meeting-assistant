# Complete System Startup Script for Inclusive Meeting Assistant
# This script checks prerequisites and starts all services

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Inclusive Meeting Assistant" -ForegroundColor Green
Write-Host "  Complete System Startup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$hasErrors = $false

# Step 1: Check Prerequisites
Write-Host "[1/5] Checking Prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python not found! Please install Python 3.8+" -ForegroundColor Red
    $hasErrors = $true
}

# Check Node.js
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js 14+" -ForegroundColor Red
    $hasErrors = $true
}

# Check MongoDB
try {
    $mongoVersion = mongo --version 2>&1 | Select-String -Pattern "version" | Select-Object -First 1
    Write-Host "  ✓ MongoDB: $mongoVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ MongoDB not found! You'll need MongoDB running." -ForegroundColor Yellow
}

Write-Host ""

if ($hasErrors) {
    Write-Host "❌ Prerequisites check failed. Please install missing components." -ForegroundColor Red
    exit 1
}

# Step 2: Check if in correct directory
Write-Host "[2/5] Verifying Project Structure..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "backend\main.py")) {
    Write-Host "  ✗ Not in project root directory!" -ForegroundColor Red
    Write-Host "  Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✓ Project structure verified" -ForegroundColor Green
Write-Host ""

# Step 3: Check .env file
Write-Host "[3/5] Checking Configuration..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
    Write-Host "  ⚠ .env file not found. Creating default..." -ForegroundColor Yellow
    @"
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=inclusive_meeting_assistant

# JWT Secret
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production

# Optional: Email Configuration
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_EMAIL=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "  ✓ Created .env file with defaults" -ForegroundColor Green
} else {
    Write-Host "  ✓ .env file exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Install Dependencies (if needed)
Write-Host "[4/5] Checking Dependencies..." -ForegroundColor Cyan
Write-Host ""

# Check if frontend node_modules exists
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host "  ✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ✓ Frontend dependencies found" -ForegroundColor Green
}

# Check Python packages (simplified check)
try {
    python -c "import fastapi, uvicorn" 2>&1 | Out-Null
    Write-Host "  ✓ Backend dependencies found" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Some backend dependencies may be missing" -ForegroundColor Yellow
    Write-Host "    Run: pip install -r requirements.txt" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Start Services
Write-Host "[5/5] Starting Services..." -ForegroundColor Cyan
Write-Host ""

Write-Host "  Starting Backend (Port 8000)..." -ForegroundColor Yellow
$env:SKIP_MODEL_PRELOAD = '1'
Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
Write-Host ''; 
Write-Host '=========================================' -ForegroundColor Cyan;
Write-Host '  BACKEND SERVER' -ForegroundColor Green;
Write-Host '  Port: 8000' -ForegroundColor White;
Write-Host '  API Docs: http://localhost:8000/docs' -ForegroundColor White;
Write-Host '=========================================' -ForegroundColor Cyan;
Write-Host '';
cd '$PWD';
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
"@

Start-Sleep -Seconds 2

Write-Host "  Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
Write-Host ''; 
Write-Host '=========================================' -ForegroundColor Cyan;
Write-Host '  FRONTEND SERVER' -ForegroundColor Green;
Write-Host '  Port: 3000' -ForegroundColor White;
Write-Host '  URL: http://localhost:3000' -ForegroundColor White;
Write-Host '=========================================' -ForegroundColor Cyan;
Write-Host '';
cd '$PWD\frontend';
npm run dev
"@

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✓ Services Starting!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services are starting in separate windows..." -ForegroundColor White
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Cyan
Write-Host "  • Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  • API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "First Time Setup:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:3000" -ForegroundColor White
Write-Host "  2. Click 'Sign Up' to create an account" -ForegroundColor White
Write-Host "  3. Login with your credentials" -ForegroundColor White
Write-Host "  4. Start using the application!" -ForegroundColor White
Write-Host ""
Write-Host "Note: Wait 15-20 seconds for services to fully start" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
