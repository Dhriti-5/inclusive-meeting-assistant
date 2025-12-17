@echo off
echo ====================================
echo   Meeting Bot Setup Script
echo ====================================
echo.

cd bot_engine

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed: 
node --version
echo.

echo [2/3] Installing bot dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/3] Setting up configuration...
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit bot_engine\.env file with your credentials:
    echo   - GOOGLE_EMAIL: Bot's Google account
    echo   - GOOGLE_PASSWORD: Bot's password
    echo   - MEETING_URL: Google Meet URL to join
    echo.
) else (
    echo .env file already exists, skipping...
)

echo ====================================
echo   Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Edit bot_engine\.env with your Google account credentials
echo 2. Set the MEETING_URL in bot_engine\.env
echo 3. Start the backend: python backend\main.py
echo 4. Run the bot: cd bot_engine ^&^& npm start
echo.
pause
