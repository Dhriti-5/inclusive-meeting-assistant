@echo off
echo ====================================
echo   Starting Meeting Bot
echo ====================================
echo.

REM Check if .env exists
if not exist bot_engine\.env (
    echo ERROR: Configuration file not found!
    echo Please run setup_bot.bat first and configure bot_engine\.env
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist bot_engine\node_modules (
    echo ERROR: Dependencies not installed!
    echo Please run setup_bot.bat first
    pause
    exit /b 1
)

echo Starting bot...
echo Press Ctrl+C to stop the bot
echo.

cd bot_engine
node bot_engine.js

pause
