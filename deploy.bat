@echo off
setlocal
cls
echo =====================================================
echo   Kolkata Chess Academy Dashboard - Hostinger Deployment
echo =====================================================
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
echo Starting deployment process...
echo.

REM Run the npm script with the password
npm run build-deploy

echo.
if %ERRORLEVEL% EQU 0 (
    echo =====================================================
    echo   Deployment completed successfully!
    echo   Your site should be live at: https://kolkatachessacademy.in
    echo =====================================================
) else (
    echo =====================================================
    echo   Deployment failed! Please check the error messages above.
    echo =====================================================
)

echo.
pause
endlocal
