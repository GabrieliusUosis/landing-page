@echo off
title Academic & Engineering Command Center
cd /d "%~dp0"

:: Check if server is already listening on port 3847
netstat -ano | findstr ":3847" | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Command Center backend server on port 3847...
    start "CommandCenterServer" /min node server\index.js
    timeout /t 2 /nobreak >nul
)

:: Open in standalone frameless desktop application window (Edge or Chrome app mode)
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    start "" msedge --app=http://localhost:3847
    exit /b 0
)

if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:3847
    exit /b 0
)

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:3847
    exit /b 0
)

start "" http://localhost:3847
