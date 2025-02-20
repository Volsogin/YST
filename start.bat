@echo off
chcp 65001 >nul 2>&1  REM Set console to UTF-8 (optional)
cls

echo Starting Yastarosta server...

REM Navigate to backend directory
cd /d D:\yastarosta\backend

REM Run the Go backend server
start "" cmd /c "go run main.go"

REM Navigate to frontend directory
cd /d D:\yastarosta\frontend

REM Open the site in the default browser
timeout /t 2 >nul
start http://localhost:8080

echo Server is running at http://localhost:8080
echo Press any key to exit...
pause >nul
exit
