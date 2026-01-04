@echo off
echo ========================================
echo   Ora Audio Capture - Quick Start
echo ========================================
echo.

if "%1"=="" (
    echo ERROR: Meeting ID required!
    echo.
    echo Usage: START_RECORDING.bat ^<meeting_id^>
    echo Example: START_RECORDING.bat 67a1b2c3d4e5f6g7h8i9j0k
    echo.
    pause
    exit /b 1
)

set MEETING_ID=%1

echo Meeting ID: %MEETING_ID%
echo.
echo Starting audio capture...
echo.

python capture_audio.py %MEETING_ID%

if errorlevel 1 (
    echo.
    echo ========================================
    echo   ERROR: Audio capture failed!
    echo ========================================
    echo.
    echo Possible issues:
    echo 1. Python not found - Install Python 3.9+
    echo 2. PyAudio not installed - Run: pip install -r requirements.txt
    echo 3. Stereo Mix disabled - Enable in Windows Sound settings
    echo.
    pause
)
