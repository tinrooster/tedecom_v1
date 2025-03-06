# Tedecom Client

This is the frontend application for the Technical Equipment Decommissioning (Tedecom) system. It provides a user-friendly interface for managing equipment decommissioning workflows, generating reports, and tracking inventory.

## Features

- **Equipment Management**: Track and manage equipment inventory
- **Decommissioning Workflows**: Step-by-step workflows for equipment decommissioning
- **Reporting**: Generate and schedule reports
- **User Management**: Role-based access control
- **Dashboard**: Visual overview of decommissioning status and metrics

## Technology Stack

- **React**: Frontend library for building user interfaces
- **TypeScript**: For type safety and better developer experience
- **Material UI**: Component library for consistent design
- **React Router**: For navigation
- **React Query**: For data fetching and caching
- **Axios**: For API communication

## Getting Started

### Prerequisites

- Node.js 14.x or later
- npm 6.x or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tinrooster/tedecom_v1.git
cd tedecom_v1/client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory with the following content:
```
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

The application will be available at http://localhost:3000.

## Project Structure

```
client/
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # Reusable components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Entry point
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Key Components

- **Layout**: Main layout component with navigation
- **DataTable**: Reusable table component with sorting and filtering
- **StatusBadge**: Visual indicator for status
- **SearchFilter**: Advanced filtering component
- **DecommissionWorkflow**: Workflow management component

## Available Scripts

- `npm start`: Start the development server
- `npm build`: Build the production-ready application
- `npm test`: Run tests
- `npm run lint`: Run linting
- `npm run format`: Format code with Prettier

## Deployment

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is proprietary and confidential. 