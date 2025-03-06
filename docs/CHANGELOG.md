# Changelog

All notable changes to the Tedecom project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Docker Compose configuration for local development
- Nginx configuration for frontend deployment
- Unit testing setup with Jest and React Testing Library
- Frontend documentation in docs/frontend-implementation.md
- Project status tracking in docs/project_status.md

### Changed
- Enhanced frontend components with TypeScript type definitions
- Improved Docker configuration for production deployment
- Updated README with more detailed installation instructions

## [0.1.0] - 2023-03-06

### Added
- Report scheduling functionality
  - Added UI components for scheduling reports in Reports.tsx
  - Implemented frequency selection (daily, weekly, monthly, quarterly, yearly)
  - Added day of week selection for weekly reports
  - Added day of month selection for monthly reports
  - Added email notification configuration for scheduled reports
- Frontend components
  - Layout component with responsive design
  - StatusBadge component for status visualization
  - DataTable component for data display with sorting and filtering
  - SearchFilter component for advanced filtering
  - DecommissionWorkflow component for workflow management

### Changed
- Enhanced reportService.ts with new methods for report scheduling
- Updated server package.json with new dependencies:
  - Added node-cron for scheduling tasks
  - Added nodemailer for sending email notifications
- Improved server/src/routes/reports.js with new endpoints for report scheduling
- Updated server/src/index.js to initialize the scheduler service

### Fixed
- Various UI improvements in the Reports page
- Fixed report generation error handling

## [0.0.1] - 2023-03-05

### Added
- Initial release of Tedecom v1 - Equipment Decommissioning System
- Basic equipment management functionality
- Report generation capabilities
- User authentication and authorization
- MongoDB integration
- Docker containerization 