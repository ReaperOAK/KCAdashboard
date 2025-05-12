# Build and deploy React app to Hostinger
param (
    [string]$Password
)

if (-not $Password) {
    Write-Host "FTP password is required. Please run the script with the -Password parameter."
    exit 1
}

# Set the FTP password as an environment variable
$env:FTP_PASSWORD = $Password

# Prepare Stockfish chess engine files
Write-Host "Preparing Stockfish files..."
if (!(Test-Path -Path "scripts")) {
    New-Item -ItemType Directory -Force -Path "scripts"
}
if (Test-Path -Path "scripts\prepare-chess-files.js") {
    node scripts/prepare-chess-files.js
}

# Build the React application
Write-Host "Building React application..."
npm run build

# Copy .htaccess to build directory
Write-Host "Copying .htaccess to build directory..."
if (Test-Path -Path "public\.htaccess") {
    Copy-Item -Path "public\.htaccess" -Destination "build\" -Force
}

# Copy web.config to build directory
if (Test-Path -Path "web.config") {
    Copy-Item -Path "web.config" -Destination "build\" -Force
}

# Run the FTP deployment script
Write-Host "Starting FTP deployment..."
node ftpconfig.js

# Clear the password from environment variables for security
$env:FTP_PASSWORD = $null

Write-Host "Deployment process completed!"
