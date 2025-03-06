import axios from 'axios';
import { Report } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const reportService = {
  // Generate new report
  generateReport: async (params: {
    title: string;
    type: Report['type'];
    description?: string;
    parameters: Report['parameters'];
    format: Report['format'];
  }): Promise<Report> => {
    const response = await axios.post(`${API_URL}/api/reports`, params);
    return response.data;
  },

  // Get all reports
  getAllReports: async (): Promise<Report[]> => {
    const response = await axios.get(`${API_URL}/api/reports`);
    return response.data;
  },

  // Get report by ID
  getReportById: async (id: string): Promise<Report> => {
    const response = await axios.get(`${API_URL}/api/reports/${id}`);
    return response.data;
  },

  // Download report file
  downloadReport: async (id: string): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/api/reports/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Delete report
  deleteReport: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/reports/${id}`);
  },

  // Get report status
  getReportStatus: async (id: string): Promise<Report['status']> => {
    const response = await axios.get(`${API_URL}/api/reports/${id}/status`);
    return response.data.status;
  },

  // Get report types
  getReportTypes: async (): Promise<Array<{ type: Report['type']; description: string }>> => {
    const response = await axios.get(`${API_URL}/api/reports/types`);
    return response.data;
  },

  // Schedule a report
  scheduleReport: async (reportId: string, scheduleData: {
    frequency: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    recipients: string[];
  }): Promise<Report> => {
    const response = await axios.post(`${API_URL}/api/reports/${reportId}/schedule`, scheduleData);
    return response.data.report;
  },

  // Cancel a scheduled report
  cancelSchedule: async (reportId: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/reports/${reportId}/schedule`);
  },

  // Generate equipment status report
  generateEquipmentStatusReport: async (params: {
    startDate?: Date;
    endDate?: Date;
    equipmentTypes?: string[];
    status?: string[];
    format: Report['format'];
  }): Promise<Report> => {
    return reportService.generateReport({
      title: 'Equipment Status Report',
      type: 'equipment_status',
      parameters: params,
      format: params.format
    });
  },

  // Generate decommission progress report
  generateDecommissionProgressReport: async (params: {
    startDate?: Date;
    endDate?: Date;
    format: Report['format'];
  }): Promise<Report> => {
    return reportService.generateReport({
      title: 'Decommission Progress Report',
      type: 'decommission_progress',
      parameters: params,
      format: params.format
    });
  },

  // Generate rack utilization report
  generateRackUtilizationReport: async (params: {
    rackIds?: string[];
    format: Report['format'];
  }): Promise<Report> => {
    return reportService.generateReport({
      title: 'Rack Utilization Report',
      type: 'rack_utilization',
      parameters: params,
      format: params.format
    });
  },

  // Generate power consumption report
  generatePowerConsumptionReport: async (params: {
    startDate?: Date;
    endDate?: Date;
    rackIds?: string[];
    format: Report['format'];
  }): Promise<Report> => {
    return reportService.generateReport({
      title: 'Power Consumption Report',
      type: 'power_consumption',
      parameters: params,
      format: params.format
    });
  }
}; 