@echo off
setlocal EnableDelayedExpansion
echo =====================================================
echo   Kolkata Chess Academy - Force Full Deployment
echo =====================================================
echo.
echo This will force upload ALL files, ignoring the change tracking manifest.
echo Useful when you want to ensure all files are properly uploaded.
echo.
set /p CONTINUE="Continue with force deployment? (Y/N): "
if /I "%CONTINUE%" NEQ "Y" (
  echo Force deployment cancelled.
  exit /b 0
)

echo.
set /p FTP_PASSWORD="Enter your FTP password: "

echo.
echo Starting force deployment process...
set "FTP_PASSWORD=%FTP_PASSWORD%"

REM Run with the --force parameter to override change detection
node ftpconfig_new.js --force

echo.
echo Force deployment completed.
pause
endlocal
