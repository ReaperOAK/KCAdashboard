@echo off
setlocal EnableDelayedExpansion
cls
echo =====================================================
echo   Kolkata Chess Academy Dashboard - Incremental Deployment
echo   (Only uploads changed files)
echo =====================================================
echo.

REM Display current date and time
echo Deployment started at: %date% %time%
echo.

REM Check if .env file exists and contains the password
if exist ".env" (
    echo Found .env file. Checking for FTP password...
    for /f "tokens=1,* delims==" %%a in (.env) do (
        if "%%a"=="ftp_password" (
            set FTP_PASSWORD=%%b
            echo Using FTP password from .env file.
            echo WARNING: Storing passwords in .env files is not secure for production.
            echo Consider using a password manager or secure vault instead.
            goto :CONTINUE
        )
    )
)

REM Prompt for FTP password if not found in .env
set /p FTP_PASSWORD="Enter your FTP password: "

:CONTINUE
echo.
echo [1/4] Starting deployment process...
echo.

REM Prepare Stockfish chess engine files
echo [2/4] Preparing Stockfish chess engine files...
if exist "scripts\prepare-chess-files.js" (
    node scripts/prepare-chess-files.js
    if !ERRORLEVEL! NEQ 0 (
        echo ERROR: Failed to prepare chess files
        goto :ERROR
    ) else (
        echo Chess files prepared successfully
    )
) else (
    echo NOTICE: Chess files preparation script not found, skipping
)

REM Build the application
echo.
echo [3/4] Building React application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build process failed
    goto :ERROR
)
echo React build completed successfully

REM Copy .htaccess and other configuration files if they exist
echo.
echo [4/4] Copying configuration files to build directory...
if exist "public\.htaccess" (
    copy "public\.htaccess" "build\" /Y
    echo - .htaccess copied
)

if exist "web.config" (
    copy "web.config" "build\" /Y
    echo - web.config copied
)

echo.
echo Starting FTP deployment process...
echo This may take several minutes depending on your connection speed.
echo Detailed progress will be shown during upload.
echo.

REM Run the npm script with the password for FTP deployment
node ftpconfig.js

echo.
if %ERRORLEVEL% EQU 0 (
    echo =====================================================
    echo   Deployment completed successfully at %time%!
    echo   Your site should be live at: https://kolkatachessacademy.in
    echo =====================================================
) else (
    :ERROR
    echo =====================================================
    echo   Deployment failed at %time%! Please check the error messages above.
    echo =====================================================
)

echo.
echo Press any key to exit...
pause
endlocal
