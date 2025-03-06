import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SystemSettings {
  emailNotifications: {
    enabled: boolean;
    smtpServer: string;
    smtpPort: number;
    username: string;
    password: string;
    fromAddress: string;
  };
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    path: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
    path: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireMfa: boolean;
  };
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    emailNotifications: {
      enabled: false,
      smtpServer: '',
      smtpPort: 587,
      username: '',
      password: '',
      fromAddress: '',
    },
    backup: {
      enabled: false,
      frequency: 'daily',
      retentionDays: 30,
      path: '',
    },
    logging: {
      level: 'info',
      retentionDays: 30,
      path: '',
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireMfa: false,
    },
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: () => fetch('/api/settings').then(res => res.json()),
    onSuccess: (data) => {
      setSettings(data);
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: SystemSettings) =>
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemSettings'] });
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success',
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Failed to update settings',
        severity: 'error',
      });
    },
  });

  const handleChange = (section: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateSettingsMutation.mutate(settings);
  };

  if (isLoading) {
    return <Typography>Loading settings...</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        {/* Email Notifications Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Email Notifications
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications.enabled}
                      onChange={(e) => handleChange('emailNotifications', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Email Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Server"
                  value={settings.emailNotifications.smtpServer}
                  onChange={(e) => handleChange('emailNotifications', 'smtpServer', e.target.value)}
                  disabled={!settings.emailNotifications.enabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  type="number"
                  value={settings.emailNotifications.smtpPort}
                  onChange={(e) => handleChange('emailNotifications', 'smtpPort', parseInt(e.target.value))}
                  disabled={!settings.emailNotifications.enabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={settings.emailNotifications.username}
                  onChange={(e) => handleChange('emailNotifications', 'username', e.target.value)}
                  disabled={!settings.emailNotifications.enabled}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={settings.emailNotifications.password}
                  onChange={(e) => handleChange('emailNotifications', 'password', e.target.value)}
                  disabled={!settings.emailNotifications.enabled}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="From Address"
                  value={settings.emailNotifications.fromAddress}
                  onChange={(e) => handleChange('emailNotifications', 'fromAddress', e.target.value)}
                  disabled={!settings.emailNotifications.enabled}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Backup Settings Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Backup Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.backup.enabled}
                      onChange={(e) => handleChange('backup', 'enabled', e.target.checked)}
                    />
                  }
                  label="Enable Automatic Backups"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Backup Frequency"
                  value={settings.backup.frequency}
                  onChange={(e) => handleChange('backup', 'frequency', e.target.value)}
                  disabled={!settings.backup.enabled}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Retention Period (days)"
                  value={settings.backup.retentionDays}
                  onChange={(e) => handleChange('backup', 'retentionDays', parseInt(e.target.value))}
                  disabled={!settings.backup.enabled}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Backup Path"
                  value={settings.backup.path}
                  onChange={(e) => handleChange('backup', 'path', e.target.value)}
                  disabled={!settings.backup.enabled}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Logging Settings Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Logging Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Log Level"
                  value={settings.logging.level}
                  onChange={(e) => handleChange('logging', 'level', e.target.value)}
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Log Retention (days)"
                  value={settings.logging.retentionDays}
                  onChange={(e) => handleChange('logging', 'retentionDays', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Log Path"
                  value={settings.logging.path}
                  onChange={(e) => handleChange('logging', 'path', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Security Settings Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Session Timeout (minutes)"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Login Attempts"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.security.requireMfa}
                      onChange={(e) => handleChange('security', 'requireMfa', e.target.checked)}
                    />
                  }
                  label="Require Multi-Factor Authentication"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={updateSettingsMutation.isLoading}
            >
              {updateSettingsMutation.isLoading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemSettings; 