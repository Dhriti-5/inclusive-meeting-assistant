$ErrorActionPreference = "Stop"

Write-Host "Starting Synapse Bot Engine..." -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# Run the bot
Write-Host "Launching Bot..." -ForegroundColor Green
npm start