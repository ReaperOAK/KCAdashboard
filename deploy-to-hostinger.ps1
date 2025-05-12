# Build and deploy React app to Hostinger with detailed progress
param (
    [string]$Password
)

# Get current timestamp for logging
$startTime = Get-Date
Write-Host "Deployment started at: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host "--------------------------------------------------------"

if (-not $Password) {
    Write-Host "❌ ERROR: FTP password is required. Please run the script with the -Password parameter." -ForegroundColor Red
    exit 1
}

# Set the FTP password as an environment variable
$env:FTP_PASSWORD = $Password
Write-Host "✅ FTP credentials configured" -ForegroundColor Green

# Create a function to show step progress
function Show-Step {
    param (
        [int]$StepNumber,
        [int]$TotalSteps,
        [string]$StepName
    )
    Write-Host ""
    Write-Host "STEP [$StepNumber/$TotalSteps]: $StepName" -ForegroundColor Cyan
    Write-Host "--------------------------------------------------------"
}

# Prepare Stockfish chess engine files
Show-Step -StepNumber 1 -TotalSteps 4 -StepName "Preparing Stockfish chess engine files"

if (!(Test-Path -Path "scripts")) {
    Write-Host "Creating scripts directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "scripts"
}

if (Test-Path -Path "scripts\prepare-chess-files.js") {
    Write-Host "Running prepare-chess-files.js..." -NoNewline
    try {
        $output = node scripts/prepare-chess-files.js 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅ Done" -ForegroundColor Green
        } else {
            Write-Host " ❌ Failed" -ForegroundColor Red
            Write-Host $output -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ Error running script" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
} else {
    Write-Host "Chess files preparation script not found, skipping..." -ForegroundColor Yellow
}

# Build the React application
Show-Step -StepNumber 2 -TotalSteps 4 -StepName "Building React application"
Write-Host "Running npm build process..." -NoNewline
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host " ❌ Build failed" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host " ❌ Build process error" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Copy config files to build directory
Show-Step -StepNumber 3 -TotalSteps 4 -StepName "Copying configuration files to build directory"
$configCount = 0

if (Test-Path -Path "public\.htaccess") {
    Write-Host "Copying .htaccess file..." -NoNewline
    Copy-Item -Path "public\.htaccess" -Destination "build\" -Force
    Write-Host " ✅" -ForegroundColor Green
    $configCount++
}

if (Test-Path -Path "web.config") {
    Write-Host "Copying web.config file..." -NoNewline
    Copy-Item -Path "web.config" -Destination "build\" -Force
    Write-Host " ✅" -ForegroundColor Green
    $configCount++
}

if ($configCount -eq 0) {
    Write-Host "No configuration files found to copy." -ForegroundColor Yellow
} else {
    Write-Host "✅ $configCount configuration files copied" -ForegroundColor Green
}

# Calculate build folder size
$buildFolder = Join-Path -Path (Get-Location) -ChildPath "build"
if (Test-Path -Path $buildFolder) {
    $buildSize = (Get-ChildItem -Path $buildFolder -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Total build size: $([Math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan
    
    # Count files to be uploaded
    $fileCount = (Get-ChildItem -Path $buildFolder -Recurse -File).Count
    Write-Host "Total files to upload: $fileCount" -ForegroundColor Cyan
}

# Run the FTP deployment script
Show-Step -StepNumber 4 -TotalSteps 4 -StepName "Starting Incremental FTP Deployment (Changed Files Only)"
Write-Host "Uploading files to Hostinger... (this may take several minutes)"
Write-Host "Detailed progress will be shown during upload."
Write-Host ""

try {
    node ftpconfig.js
    if ($LASTEXITCODE -eq 0) {
        $endTime = Get-Date
        $duration = $endTime - $startTime
        Write-Host ""
        Write-Host "--------------------------------------------------------"
        Write-Host "✅ DEPLOYMENT PROCESS COMPLETED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "Started: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))"
        Write-Host "Ended:   $($endTime.ToString('yyyy-MM-dd HH:mm:ss'))"
        Write-Host "Duration: $([Math]::Round($duration.TotalMinutes, 2)) minutes"
        Write-Host "Your site should be live at: https://kolkatachessacademy.in"
        Write-Host "--------------------------------------------------------"
    } else {
        Write-Host "❌ FTP deployment failed with code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running FTP deployment" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Clear the password from environment variables for security
$env:FTP_PASSWORD = $null

# Return the last exit code from the FTP deployment
exit $LASTEXITCODE
