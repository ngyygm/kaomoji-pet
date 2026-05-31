@echo off
cd /d "%~dp0"

if exist "node_modules" goto :launch

echo ============================================
echo   kaomoji-pet - First run, installing...
echo ============================================
call npm install
if errorlevel 1 (
    echo.
    echo Install failed! Please install Node.js first:
    echo https://nodejs.org
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
