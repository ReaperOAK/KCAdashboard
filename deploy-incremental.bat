@echo off
setlocal EnableDelayedExpansion
cls
echo =====================================================
echo   Kolkata Chess Academy - Incremental Deployment
echo   (Only uploads changed files)
echo =====================================================
echo.

REM Check if build directory exists
if not exist "build" (
  echo ERROR: Build directory not found!
  echo Please run "npm run build" first to create the build files.
  pause
  exit /b 1
)

echo.
set /p FTP_PASSWORD="Enter your FTP password: "

echo.
echo Starting incremental deployment process...
set "FTP_PASSWORD=%FTP_PASSWORD%"

REM Run the incremental deployment (without --force parameter)
node ftpconfig_new.js

echo.
pause
endlocal
