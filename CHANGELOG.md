# Changelog

## [1.1.0] - 2023-03-06

### Added
- Report scheduling functionality
  - Added UI components for scheduling reports in Reports.tsx
  - Implemented frequency selection (daily, weekly, monthly, quarterly, yearly)
  - Added day of week selection for weekly reports
  - Added day of month selection for monthly reports
  - Added email notification configuration for scheduled reports

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

## [1.0.0] - 2023-03-05

### Added
- Initial release of Tedecom v1 - Equipment Decommissioning System
- Basic equipment management functionality
- Report generation capabilities
- User authentication and authorization
- MongoDB integration
- Docker containerization 