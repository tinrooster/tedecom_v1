import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import EquipmentManagement from './pages/EquipmentManagement';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import DecommissionWorkflowPage from './pages/DecommissionWorkflowPage';
import Layout from './components/Layout';

// New Components
import Dashboard from './pages/Dashboard';
import RackLayout from './pages/RackLayout';
import RackDetail from './pages/RackDetail';
import EquipmentDetail from './pages/EquipmentDetail';
import EquipmentForm from './pages/EquipmentForm';
import DecommissionWorkflow from './pages/DecommissionWorkflow';
import Settings from './pages/Settings';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0',
      light: '#5e92f3',
      dark: '#003c8f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00796b',
      light: '#48a999',
      dark: '#004c40',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#f57c00',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#388e3c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3} 
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={5000}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="racks" element={<RackLayout />} />
                  <Route path="racks/:rackId" element={<RackDetail />} />
                  <Route path="equipment" element={<ProtectedRoute><Layout><EquipmentManagement /></Layout></ProtectedRoute>} />
                  <Route path="equipment/:equipmentId" element={<EquipmentDetail />} />
                  <Route path="equipment/add/:rackId" element={<EquipmentForm />} />
                  <Route path="equipment/edit/:equipmentId" element={<EquipmentForm />} />
                  <Route path="equipment/workflow/:equipmentId" element={<DecommissionWorkflow />} />
                  <Route path="reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="admin" element={
                    <ProtectedRoute requiredRole="admin">
                      <Layout><AdminDashboard /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="workflows/:id" element={<ProtectedRoute><Layout><DecommissionWorkflowPage /></Layout></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </Router>
          </LocalizationProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 