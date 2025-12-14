# InclusiveMeet Frontend - Setup Script
# Run this in PowerShell from the frontend directory

Write-Host "🚀 InclusiveMeet Frontend Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion is installed`n" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes...`n" -ForegroundColor Gray

npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Dependencies installed successfully!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (Test-Path .env) {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found, creating from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
}

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review the .env file and update the API URL if needed" -ForegroundColor White
Write-Host "2. Start the development server:`n" -ForegroundColor White
Write-Host "   npm run dev`n" -ForegroundColor Yellow
Write-Host "3. Open http://localhost:3000 in your browser`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md       - Full documentation" -ForegroundColor White
Write-Host "   - QUICKSTART.md   - Quick start guide" -ForegroundColor White
Write-Host "   - SETUP_COMPLETE.md - Feature overview`n" -ForegroundColor White

Write-Host "Happy coding! 🚀" -ForegroundColor Green
