#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Build the Docker image
echo "Building Docker image..."
docker build -t tedecom-server .

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Start the application
echo "Starting the application..."
docker-compose up -d

# Wait for the application to be ready
echo "Waiting for the application to be ready..."
sleep 10

# Check if the application is running
if curl -s http://localhost:3000/api/monitoring/health | grep -q "healthy"; then
  echo "Deployment successful! Application is healthy."
else
  echo "Deployment completed but health check failed. Please check the logs."
  docker-compose logs app
  exit 1
fi 