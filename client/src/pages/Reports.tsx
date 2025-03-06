import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Download as DownloadIcon, 
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { Report } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<Report['type'] | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [format, setFormat] = useState<Report['format']>('pdf');
  const [openDialog, setOpenDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [scheduleFrequency, setScheduleFrequency] = useState<string>('daily');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState<number>(1); // Monday
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState<number>(1);
  const [scheduleTime, setScheduleTime] = useState<Date | null>(new Date());
  const [scheduleRecipients, setScheduleRecipients] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: reportService.getAllReports,
    refetchInterval: refreshInterval,
  });

  // Fetch report types
  const { data: reportTypes } = useQuery({
    queryKey: ['reportTypes'],
    queryFn: reportService.getReportTypes,
  });

  // Generate report mutation
  const generateMutation = useMutation({
    mutationFn: reportService.generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setOpenDialog(false);
      // Start auto-refresh for 30 seconds
      setRefreshInterval(5000);
      setTimeout(() => setRefreshInterval(null), 30000);
    },
  });

  // Delete report mutation
  const deleteMutation = useMutation({
    mutationFn: reportService.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  // Schedule report mutation
  const scheduleMutation = useMutation({
    mutationFn: (params: { reportId: string, scheduleData: any }) => 
      reportService.scheduleReport(params.reportId, params.scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setOpenScheduleDialog(false);
      setSelectedReport(null);
    },
  });

  // Cancel schedule mutation
  const cancelScheduleMutation = useMutation({
    mutationFn: reportService.cancelSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const handleGenerateReport = async () => {
    if (!selectedReportType) return;

    const params = {
      title: `${reportTypes?.find(t => t.type === selectedReportType)?.description || selectedReportType}`,
      type: selectedReportType,
      parameters: {
        startDate,
        endDate,
      },
      format,
    };

    generateMutation.mutate(params);
  };

  const handleDownload = async (report: Report) => {
    try {
      const blob = await reportService.downloadReport(report._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.${report.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleScheduleReport = (report: Report) => {
    setSelectedReport(report);
    
    // Initialize schedule form with default values or existing schedule
    if (report.schedule) {
      setScheduleFrequency(report.schedule.frequency);
      setScheduleDayOfWeek(report.schedule.dayOfWeek || 1);
      setScheduleDayOfMonth(report.schedule.dayOfMonth || 1);
      
      // Parse time string to Date
      if (report.schedule.time) {
        const [hours, minutes] = report.schedule.time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        setScheduleTime(date);
      } else {
        setScheduleTime(new Date());
      }
      
      setScheduleRecipients(report.schedule.recipients?.join(', ') || '');
    } else {
      // Default values
      setScheduleFrequency('daily');
      setScheduleDayOfWeek(1);
      setScheduleDayOfMonth(1);
      setScheduleTime(new Date());
      setScheduleRecipients('');
    }
    
    setOpenScheduleDialog(true);
  };

  const handleSaveSchedule = () => {
    if (!selectedReport) return;
    
    // Format time as HH:MM
    const hours = scheduleTime?.getHours().toString().padStart(2, '0') || '00';
    const minutes = scheduleTime?.getMinutes().toString().padStart(2, '0') || '00';
    const timeString = `${hours}:${minutes}`;
    
    // Parse recipients
    const recipients = scheduleRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email);
    
    const scheduleData = {
      frequency: scheduleFrequency,
      dayOfWeek: scheduleFrequency === 'weekly' ? scheduleDayOfWeek : undefined,
      dayOfMonth: ['monthly', 'quarterly', 'yearly'].includes(scheduleFrequency) ? scheduleDayOfMonth : undefined,
      time: timeString,
      recipients,
    };
    
    scheduleMutation.mutate({ 
      reportId: selectedReport._id, 
      scheduleData 
    });
  };

  const handleCancelSchedule = (reportId: string) => {
    cancelScheduleMutation.mutate(reportId);
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
      case 'in_progress':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="report tabs">
          <Tab label="Generate Reports" />
          <Tab label="Report History" />
          <Tab label="Scheduled Reports" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={selectedReportType}
                  label="Report Type"
                  onChange={(e) => setSelectedReportType(e.target.value as Report['type'])}
                >
                  {reportTypes?.map((type) => (
                    <MenuItem key={type.type} value={type.type}>
                      {type.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={format}
                  label="Format"
                  onChange={(e) => setFormat(e.target.value as Report['format'])}
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
                disabled={!selectedReportType}
                fullWidth
              >
                Generate
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports?.filter(report => !report.schedule).map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.format.toUpperCase()}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={getStatusColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Download">
                      <span>
                        <IconButton
                          onClick={() => handleDownload(report)}
                          disabled={report.status !== 'completed'}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Schedule">
                      <IconButton
                        onClick={() => handleScheduleReport(report)}
                      >
                        <ScheduleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => deleteMutation.mutate(report._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports?.filter(report => report.schedule).map((report) => (
                <TableRow key={report._id}>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>{report.format.toUpperCase()}</TableCell>
                  <TableCell>
                    {report.schedule?.frequency} 
                    {report.schedule?.time && ` at ${report.schedule.time}`}
                  </TableCell>
                  <TableCell>
                    {report.schedule?.recipients?.join(', ')}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Schedule">
                      <IconButton
                        onClick={() => handleScheduleReport(report)}
                      >
                        <ScheduleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel Schedule">
                      <IconButton
                        onClick={() => handleCancelSchedule(report._id)}
                        color="error"
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => deleteMutation.mutate(report._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Generate Report Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to generate a {reportTypes?.find(t => t.type === selectedReportType)?.description || selectedReportType} report?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateReport} 
            variant="contained"
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? <CircularProgress size={24} /> : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog 
        open={openScheduleDialog} 
        onClose={() => setOpenScheduleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1">
                Schedule {selectedReport?.title}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={scheduleFrequency}
                  label="Frequency"
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Time"
                  value={scheduleTime}
                  onChange={setScheduleTime}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            {scheduleFrequency === 'weekly' && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Day of Week</InputLabel>
                  <Select
                    value={scheduleDayOfWeek}
                    label="Day of Week"
                    onChange={(e) => setScheduleDayOfWeek(Number(e.target.value))}
                  >
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {['monthly', 'quarterly', 'yearly'].includes(scheduleFrequency) && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Day of Month"
                  type="number"
                  fullWidth
                  value={scheduleDayOfMonth}
                  onChange={(e) => setScheduleDayOfMonth(Number(e.target.value))}
                  inputProps={{ min: 1, max: 31 }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                label="Recipients (comma separated)"
                fullWidth
                value={scheduleRecipients}
                onChange={(e) => setScheduleRecipients(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveSchedule} 
            variant="contained"
            disabled={scheduleMutation.isPending}
            startIcon={<EmailIcon />}
          >
            {scheduleMutation.isPending ? <CircularProgress size={24} /> : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports; 