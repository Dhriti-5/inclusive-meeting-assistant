@echo off
echo.
echo =============================================
echo   Inclusive Meeting Assistant - Quick Start
echo =============================================
echo.
echo Starting services...
echo.

REM Start backend
start "Backend Server" cmd /k "cd /d %~dp0 && echo Starting Backend... && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait a bit
timeout /t 3 /nobreak > nul

REM Start frontend
start "Frontend Server" cmd /k "cd /d %~dp0frontend && echo Starting Frontend... && npm run dev"

echo.
echo Services are starting in separate windows...
echo.
echo Access your application at:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000/docs
echo.
pause
