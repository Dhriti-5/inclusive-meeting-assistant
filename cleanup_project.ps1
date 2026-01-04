# Clean up old/unused files from the Ora project

Write-Host "🧹 Cleaning up Ora AI project..." -ForegroundColor Cyan

$root = "C:\Users\Pc\Deep Learning Specialization\inclusive-meeting-assistant"
cd $root

# Create archive folder for old docs
$archiveFolder = Join-Path $root "old_docs_archive"
if (!(Test-Path $archiveFolder)) {
    New-Item -ItemType Directory -Path $archiveFolder | Out-Null
}

# Files to keep (important)
$keepFiles = @(
    "README.md",
    "ARCHITECTURE.md", 
    "ORA_README.md",
    "requirements.txt",
    ".env",
    ".gitignore"
)

# Move old documentation to archive
$oldDocs = @(
    "AUTHENTICATED_BOT_GUIDE.md",
    "BACKEND_FIX_SUMMARY.md",
    "BOT_SURFING_DEBUG.md",
    "BOT_SURFING_FIX.md",
    "CLEANUP_SUMMARY.md",
    "COMPLETE_FLOW_DIAGRAM.md",
    "COMPLETE_USER_GUIDE.md",
    "DIAGNOSTIC_GUIDE.md",
    "FEATURE_1_COMPLETE.md",
    "FEATURE_VERIFICATION_COMPLETE.md",
    "FIX_AND_START_BOT.ps1",
    "FIX_BOT_CONNECTING_ISSUE.md",
    "FRONTEND_VERIFICATION_CHECKLIST.md",
    "GUEST_BOT_IMPLEMENTATION_SUMMARY.md",
    "HOW_TO_USE_BOT.md",
    "INTEGRATION_GUIDE.md",
    "PHASE3_COMPLETE.md",
    "QUICK_START_AUTHENTICATED_BOT.md",
    "QUICK_START_NOW.md",
    "START_HERE_IF_BOT_NOT_WORKING.md",
    "TESTING_GUIDE.md",
    "UNIFIED_SYSTEM_GUIDE.md",
    "IMPLEMENTATION_COMPLETE.md",
    "QUICK_TEST_GUIDE.md",
    "TEST_BOT_FLOW.md",
    "WHAT_WAS_FIXED.md"
)

Write-Host "`n📦 Archiving old documentation..." -ForegroundColor Yellow
foreach ($file in $oldDocs) {
    $filePath = Join-Path $root $file
    if (Test-Path $filePath) {
        Move-Item $filePath $archiveFolder -Force
        Write-Host "  ✅ Archived: $file" -ForegroundColor Green
    }
}

# Delete old test scripts
$testScripts = @(
    "comprehensive_test.py",
    "feature_checklist.py",
    "quick_module_test.py",
    "test_brain_layer.py",
    "test_rag.py",
    "TEST_INTEGRATION.ps1",
    "run_pipeline.py"
)

Write-Host "`n🗑️  Removing old test scripts..." -ForegroundColor Yellow
foreach ($file in $testScripts) {
    $filePath = Join-Path $root $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "  ✅ Deleted: $file" -ForegroundColor Green
    }
}

# Delete old startup scripts (keep only important ones)
$oldStartups = @(
    "START_ALL_SERVICES.ps1",
    "START_BOT_SIMPLE.bat",
    "START_SYSTEM.ps1",
    "start_unified_system.ps1",
    "start.ps1",
    "START_ORA_SYSTEM.ps1"
)

Write-Host "`n🗑️  Removing old startup scripts..." -ForegroundColor Yellow
foreach ($file in $oldStartups) {
    $filePath = Join-Path $root $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "  ✅ Deleted: $file" -ForegroundColor Green
    }
}

# Clean backend temp files
Write-Host "`n🧹 Cleaning backend temp files..." -ForegroundColor Yellow
$backendTempFiles = @(
    "backend/create_ora_user.py",
    "backend/check_meetings.py", 
    "backend/cleanup_databases.py",
    "backend/fix_ora_password.py",
    "backend/test_email_connection.py",
    "backend/tempCodeRunnerFile.py",
    "backend/test_results.txt"
)

foreach ($file in $backendTempFiles) {
    $filePath = Join-Path $root $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "  ✅ Deleted: $file" -ForegroundColor Green
    }
}

# Clean bot_engine old files
Write-Host "`n🧹 Cleaning bot_engine old files..." -ForegroundColor Yellow
$botOldFiles = @(
    "bot_engine/debug_page.html",
    "bot_engine/encode_cookies.js",
    "bot_engine/GOOGLE_MEET_BOT_ISSUE.md",
    "bot_engine/preflight_check.js",
    "bot_engine/test_cookies.js",
    "bot_engine/test_guest_bot.bat",
    "bot_engine/test_guest_setup.js",
    "bot_engine/ARCHITECTURE_GUEST_MODE.md",
    "bot_engine/AUTH_BOT_SETUP.md",
    "bot_engine/GUEST_MODE_GUIDE.md",
    "bot_engine/README.md",
    "bot_engine/run_guest_bot.ps1"
)

foreach ($file in $botOldFiles) {
    $filePath = Join-Path $root $file
    if (Test-Path $filePath) {
        Remove-Item $filePath -Force
        Write-Host "  ✅ Deleted: $file" -ForegroundColor Green
    }
}

Write-Host "`n✅ Cleanup complete!" -ForegroundColor Green
Write-Host "`n📂 Archived docs saved to: $archiveFolder" -ForegroundColor Cyan
Write-Host "`n🎉 Project is now clean and organized for Ora!" -ForegroundColor Green
