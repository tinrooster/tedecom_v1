# Exit on error
$ErrorActionPreference = "Stop"

# Load environment variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            Set-Item -Path "Env:$name" -Value $value
        }
    }
}

# Build the Docker image
Write-Host "Building Docker image..."
docker build -t tedecom-server .

# Stop existing containers
Write-Host "Stopping existing containers..."
docker-compose down

# Start the application
Write-Host "Starting the application..."
docker-compose up -d

# Wait for the application to be ready
Write-Host "Waiting for the application to be ready..."
Start-Sleep -Seconds 10

# Check if the application is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/monitoring/health" -UseBasicParsing
    if ($response.Content -match "healthy") {
        Write-Host "Deployment successful! Application is healthy."
    } else {
        Write-Host "Deployment completed but health check failed. Please check the logs."
        docker-compose logs app
        exit 1
    }
} catch {
    Write-Host "Deployment completed but health check failed. Please check the logs."
    docker-compose logs app
    exit 1
} 