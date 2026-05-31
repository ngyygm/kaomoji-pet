@echo off
cd /d "%~dp0"

if exist "node_modules" goto :launch

echo ============================================
echo   kaomoji-pet - First run, installing...
echo ============================================
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
call npm install --loglevel=error --registry=https://registry.npmmirror.com
if errorlevel 1 (
    echo.
    echo Install failed! Possible reasons:
    echo   1. Node.js not installed: https://nodejs.org
    echo   2. Network issue, try again later
    pause
    exit /b 1
)
echo.
echo Install done! Starting...
timeout /t 2 /nobreak >nul

:launch
if "%1"=="run" goto :run
mshta vbscript:CreateObject("WScript.Shell").Run("cmd /c ""%~f0"" run",0,False)(window.close)
exit
:run
taskkill /F /IM electron.exe >nul 2>&1
npx electron .
