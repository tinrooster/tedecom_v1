# Tedecom

A comprehensive system for managing equipment decommissioning processes, reporting, and workflow management.

## Project Overview

Tedecom (Technical Equipment Decommissioning System) is designed to streamline the process of decommissioning technical equipment in organizations. It provides a complete solution for tracking equipment through the decommissioning lifecycle, generating compliance reports, maintaining audit trails, ensuring proper data sanitization procedures, and managing recycling and disposal workflows.

## Components

The project consists of two main components:

### Backend Server

A Node.js server that provides the API endpoints, database connectivity, authentication, and business logic for the application.

### Frontend Client

A React-based web application that provides the user interface for interacting with the system.

## Prerequisites

- Node.js 18 or later
- Docker Desktop for Windows
- MongoDB 4.4 or later

## Local Development

### Backend

1. Clone the repository:
```powershell
git clone <repository-url>
cd tedecom
```

2. Install dependencies:
```powershell
cd server
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

### Frontend

1. Install dependencies:
```powershell
cd client
npm install
```

2. Create environment file:
```powershell
Copy-Item .env.example .env
```
Edit `.env` with your configuration.

3. Start the development server:
```powershell
npm start
```

The frontend application will be available at http://localhost:3000.

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

## Features

### Equipment Management
- Equipment registration and tracking
- Asset lifecycle management
- Inventory management
- Equipment history tracking

### Decommissioning Workflow
- Step-by-step workflow management
- Task assignment to specific technicians
- Status tracking and updates
- Multi-stage approval process

### Data Sanitization
- Standardized data wiping procedures
- Multi-step verification process
- Sanitization certification
- Regulatory compliance

### Reporting
- Equipment status reports
- Decommission progress reports
- Rack utilization reports
- Power consumption reports
- Multiple export formats (PDF, Excel, CSV)
- Scheduled report generation
- Email delivery

### User Management
- Role-based access control
- User authentication
- Profile management
- Activity tracking

## Frontend Components

The frontend includes several reusable components:

- **Layout**: Responsive layout with drawer, app bar, and navigation
- **DataTable**: Table with sorting, pagination, and filtering
- **SearchFilter**: Advanced filtering with multiple field types
- **StatusBadge**: Visual status indicators
- **DecommissionWorkflow**: Workflow management interface

## Testing

The project includes comprehensive testing for both frontend and backend components:

### Backend Testing

```powershell
cd server
npm test
```

Backend tests include:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Database operation tests

### Frontend Testing

```powershell
cd client
npm test
```

Frontend tests include:
- Component tests with React Testing Library
- Hook tests
- Service tests
- End-to-end tests with Cypress

### Test Coverage

Generate test coverage reports:

```powershell
# Backend coverage
cd server
npm run test:coverage

# Frontend coverage
cd client
npm run test:coverage
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

- **Lint**: Runs ESLint to ensure code quality
- **Test**: Runs all tests and generates coverage reports
- **Build**: Builds the application for production
- **Deploy**: Deploys the application to the appropriate environment

The CI/CD pipeline is configured to run on:
- Pull requests to the main branch
- Pushes to the main branch
- Manual triggers for deployment

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
Invoke-WebRequest -Uri "http://localhost:5000/api/settings/rotate-logs" -Method POST
```

### Backup
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/settings/backup" -Method POST
```

### Report Cleanup
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/reports/cleanup" -Method POST
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
Invoke-WebRequest -Uri "http://localhost:5000/api/monitoring/status"
```

## Documentation

For more detailed documentation, please refer to the following:

- [User Documentation](./docs/user_documentation.md)
- [Project Framework](./docs/project_framework.md)
- [Project Status](./docs/project_status.md)
- [Changelog](./docs/CHANGELOG.md)
- [Frontend Implementation](./docs/frontend-implementation.md)

## Support

For support, please contact the system administrator or create an issue in the repository.

## License

This project is proprietary and confidential. 