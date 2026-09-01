@echo off
title MATRIX USER CREATION SYSTEM v2.0
color 0A
mode con cols=75 lines=28

:MENU
cls
echo ===========================================================================
echo   ______  _______  ____    ____  ___     _  _     ____    ____  _______ 
echo  / ___/  /  ____/ / _  \  / _  \ \  \   / // \   / __ \  / ___/ /  ____/ 
echo  ^| /__   ^| /__    ^| /_/ / ^| /_/ /  \  \_/ /  ^|  ^| /  \ \ ^| /__   ^| /__   
echo  \___ \  ^|  __/   ^|  _  ^| ^|  _  ^|   \   /   ^|  ^| ^|  ^| ^| \___ \  ^|  __/   
echo  ____/ ^| ^| /___   ^| ^| \ \ ^| ^| \ \    ^| ^|    ^|  ^| \__/ / ____/ ^| ^| /___   
echo /_____/  /_____/  /_/  \_/ /_/  \_/    /_/    /__/ \____/ /_____/  /_____/   
echo.
echo                 --- MAINFRAME ACCESS CONTROL TERMINAL ---
echo ===========================================================================
echo.
echo [!] ACCESS LEVEL: SYSTEM ADMINISTRATOR
echo.
echo ---------------------------------------------------------------------------
set /p USERNAME=" [>] Enter Target Username                 : "
set /p EMAIL=" [>] Enter Target Email (Press Enter to skip) : "
set /p PASSWORD=" [>] Enter Security Clearance Passcode     : "
echo ---------------------------------------------------------------------------
echo.
echo  [ SELECT AUTHORIZATION ROLE ]
echo    [1] MANAGER  (Field Operations Access)
echo    [2] OWNER    (Full Enterprise Oversight)
echo.
set /p ROLE_CHOICE=" [>] Select Security Class (1 or 2)     : "

if "%ROLE_CHOICE%"=="2" (
    set ROLE=owner
) else (
    set ROLE=manager
)

cls
echo ===========================================================================
echo                >>> INITIALIZING MAIN-SYSTEM INJECTION <<<
echo ===========================================================================
echo.
echo [+] Target User  : %USERNAME%
echo [+] Email        : %EMAIL%
echo [+] Assign Role  : %ROLE%
echo.
echo [!] Injecting credentials into database...
echo.

:: Fake retro hacking loading animation
<nul set /p= [ PROGRESS ] [
for /l %%i in (1,1,25) do (
    <nul set /p=&#9608;
    timeout /t 0 >nul 2>&1
)
echo ] 100%%
echo.
echo ---------------------------------------------------------------------------

cd /d C:\TenantApp\legacy-backend
call ..\venv\Scripts\activate

python manage.py create_app_user --username "%USERNAME%" --email "%EMAIL%" --password "%PASSWORD%" --role %ROLE%

echo ---------------------------------------------------------------------------
echo.
echo [!] MISSION ACCOMPLISHED. User status updated in system ledger.
echo.
pause