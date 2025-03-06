# Tedecom Server

A Node.js server for managing equipment decommissioning and reporting.

## Prerequisites

- Node.js 18 or later
- Docker Desktop for Windows
- MongoDB 4.4 or later

## Local Development

1. Clone the repository:
```powershell
git clone <repository-url>
cd tedecom-server
```

2. Install dependencies:
```powershell
npm install
```

3. Create environment file:
```powershell
Copy-Item .env.example .env
```
Edit `.env` with your configuration.

4. Start the development server:
```powershell
npm run dev
```

## Docker Deployment

1. Build and start the containers:
```powershell
docker-compose up -d
```

2. Check the logs:
```powershell
docker-compose logs -f
```

3. Stop the containers:
```powershell
docker-compose down
```

## Production Deployment

1. Copy the environment file and configure it:
```powershell
Copy-Item .env.example .env
# Edit .env with production values
```

2. Run the deployment script:
```powershell
.\deploy.ps1
```

## Health Checks

The application provides several health check endpoints:

- `/api/monitoring/health` - Public health check endpoint
- `/api/monitoring/status` - Detailed system status (admin only)
- `/api/monitoring/metrics/reports` - Report metrics (admin only)
- `/api/monitoring/metrics/resources` - Resource usage metrics (admin only)

## Monitoring

The application includes built-in monitoring for:
- System resources (CPU, memory, disk)
- Database connectivity
- Report generation status
- Error rates and failures

## Backup and Recovery

The system automatically performs backups based on the configured schedule:
- Database backups
- Report storage backups
- Configuration backups

Backup retention is configurable through the environment variables.

## Security

- JWT-based authentication
- Role-based access control
- Rate limiting
- CORS configuration
- Secure headers
- Input validation

## Logging

Logs are stored in the `logs` directory and rotated automatically:
- `error.log` - Error-level logs
- `combined.log` - All logs

## Maintenance

### Log Rotation
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/settings/rotate-logs" -Method POST
```

### Backup
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/settings/backup" -Method POST
```

### Report Cleanup
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/reports/cleanup" -Method POST
```

## Troubleshooting

1. Check the logs:
```powershell
docker-compose logs -f app
```

2. Verify MongoDB connection:
```powershell
docker-compose exec mongodb mongosh
```

3. Check system status:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/monitoring/status"
```

## Support

For support, please contact the system administrator or create an issue in the repository. 