@echo off
title Stopping Tenant Management System...

echo ===================================================
echo [!] SHUTTING DOWN TENANT APP SERVERS...
echo ===================================================
echo.

:: 1. Target CMD shell windows directly by searching command line flags
powershell -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*--APP_FRONTEND*' -or $_.CommandLine -like '*--APP_BACKEND*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: 2. Kill task trees by title match
taskkill /FI "WINDOWTITLE eq Django Backend*" /F /T >nul 2>&1
taskkill /FI "WINDOWTITLE eq React Frontend*" /F /T >nul 2>&1

:: 3. Kill any remaining processes listening on ports 8000 and 5173
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /T /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /T /PID %%a >nul 2>&1

:: 4. Clean up any lingering node or python instances
taskkill /IM node.exe /F >nul 2>&1

echo [✓] All servers and terminal windows terminated successfully!
echo.
timeout /t 2 >nul