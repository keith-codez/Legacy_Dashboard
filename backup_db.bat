@echo off
title Tenant Management System - DB Backup

:: Set target directory (default to a 'backups' folder on your C: drive or flash stick)
set BACKUP_DIR=C:\TenantApp\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

:: Generate timestamp for filename (YYYY-MM-DD_HHMM)
for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set datetime=%%i
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,4%

set BACKUP_FILE=%BACKUP_DIR%\db_backup_%TIMESTAMP%.json

echo ===================================================
echo [!] CREATING DATABASE BACKUP...
echo ===================================================
echo.

cd /d C:\TenantApp\legacy-backend
call ..\venv\Scripts\activate

:: Dump everything except Django system permissions/contenttypes
python manage.py dumpdata --natural-foreign --natural-primary -e contenttypes -e auth.Permission --indent 2 > "%BACKUP_FILE%"

echo.
echo [✓] SUCCESS! Backup saved to:
echo     %BACKUP_FILE%
echo.
echo [i] Tip: You can copy this file directly to your flash stick!
echo ===================================================
pause