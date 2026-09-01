@echo off
title Launching Tenant Management System...

:: 1. Start Django Backend Server
start /min "Django Backend" cmd /k "title Django Backend --APP_BACKEND && cd /d C:\TenantApp\legacy-backend && call ..\venv\Scripts\activate && python manage.py runserver localhost:8000"

:: 2. Start React/Vite Frontend Server
start /min "React Frontend" cmd /k "title React Frontend --APP_FRONTEND && cd /d C:\TenantApp\manager-dashboard && npm run dev"

:: 3. Wait 5 seconds for servers to boot up, then open browser
timeout /t 5 >nul
start http://localhost:5173