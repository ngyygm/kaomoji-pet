@echo off
cd /d "%~dp0"
if "%1"=="run" goto :run
mshta vbscript:CreateObject("WScript.Shell").Run("cmd /c ""%~f0"" run",0,False)(window.close)
exit
:run
taskkill /F /IM electron.exe >nul 2>&1
npx electron .
