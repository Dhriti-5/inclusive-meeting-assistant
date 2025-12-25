# Student Setup Script - FREE Configuration (No Cloud Costs!)
# Run this to set up your project without Google Cloud

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  🎓 STUDENT SETUP - FREE VERSION" -ForegroundColor Green
Write-Host "  No Cloud Costs - 100% Local" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Backup Google Cloud credentials (if exists)
if (Test-Path "gcp_credentials.json") {
    Write-Host "[1/6] Backing up Google Cloud credentials..." -ForegroundColor Yellow
    Move-Item "gcp_credentials.json" "gcp_credentials.json.backup" -Force
    Write-Host "  ✓ Backed up to gcp_credentials.json.backup" -ForegroundColor Green
} else {
    Write-Host "[1/6] No Google Cloud credentials found (Good! Saving money!)" -ForegroundColor Green
}
Write-Host ""

# Step 2: Create student-friendly .env
Write-Host "[2/6] Creating FREE configuration..." -ForegroundColor Cyan
$envContent = @"
# 🎓 STUDENT CONFIGURATION - 100% FREE!
# No cloud costs, everything runs locally

# MongoDB (Local - FREE)
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=inclusive_meeting_assistant

# JWT Secret (Change this to something random!)
JWT_SECRET_KEY=$(Get-Random -Count 32 | ForEach-Object { '{0:x}' -f $_ } | Join-String)

# TTS Configuration (Use FREE local TTS)
USE_GOOGLE_CLOUD=false
USE_LOCAL_TTS=true

# Email (Optional - FREE Gmail SMTP)
# To use: Create app password in Gmail settings
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_EMAIL=your-free-gmail@gmail.com
# SMTP_PASSWORD=your-app-password

# Performance (Optional)
SKIP_MODEL_PRELOAD=1

# Student Mode (Enables optimizations)
STUDENT_MODE=true
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "  ✓ Created .env with FREE configuration" -ForegroundColor Green
Write-Host ""

# Step 3: Install free TTS
Write-Host "[3/6] Installing FREE Text-to-Speech..." -ForegroundColor Cyan
try {
    pip install pyttsx3 --quiet
    Write-Host "  ✓ pyttsx3 installed (FREE TTS)" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ pyttsx3 installation failed. Install manually: pip install pyttsx3" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Check other dependencies
Write-Host "[4/6] Checking core dependencies..." -ForegroundColor Cyan
$required = @("fastapi", "uvicorn", "motor", "transformers", "whisper")
foreach ($pkg in $required) {
    try {
        python -c "import $pkg" 2>$null
        Write-Host "  ✓ $pkg" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠ $pkg not found" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 5: MongoDB check
Write-Host "[5/6] Checking MongoDB..." -ForegroundColor Cyan
try {
    $mongoTest = mongo --eval "db.version()" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ MongoDB not running. Start it with: mongod" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠ MongoDB not found. Install from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Create student guide
Write-Host "[6/6] Creating quick start guide..." -ForegroundColor Cyan
$guideContent = @"
# 🎓 Quick Start Guide - Student Edition

## Your Setup is 100% FREE! 🎉

Everything runs locally - no cloud costs!

## What's Configured:

✅ Local MongoDB (free)
✅ Free Text-to-Speech (pyttsx3)
✅ OpenAI Whisper (runs locally)
✅ HuggingFace models (free)
✅ Local authentication
✅ No Google Cloud charges

## To Start:

1. Start MongoDB:
   mongod

2. Start Backend:
   python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

3. Start Frontend:
   cd frontend
   npm run dev

4. Open browser:
   http://localhost:3000

## Need Help?

- Read: STUDENT_FREE_SETUP.md
- Check: COMPLETE_STARTUP_GUIDE.md
- Test: python verify_system.py

## Free Resources:

🎓 GitHub Student Pack: https://education.github.com/pack
📚 Free MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
💻 Free Hosting: Vercel, Netlify, Railway
🤖 Free AI: HuggingFace, Google Colab

---

💡 Pro Tip: Apply for GitHub Student Pack for free credits on multiple platforms!
"@

$guideContent | Out-File -FilePath "STUDENT_START.md" -Encoding UTF8
Write-Host "  ✓ Created STUDENT_START.md" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ✅ STUDENT SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your project is now 100% FREE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start MongoDB: mongod" -ForegroundColor White
Write-Host "  2. Run backend: python -m uvicorn backend.main:app --port 8000" -ForegroundColor White
Write-Host "  3. Run frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "  4. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Or use quick start: .\start_all.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 Read STUDENT_FREE_SETUP.md for more info" -ForegroundColor Cyan
Write-Host ""
Write-Host "💰 Monthly Cost: `$0 (FREE!)" -ForegroundColor Green
Write-Host ""
