import { IReport } from '../models/Report';
import Report from '../models/Report';
import Equipment from '../models/Equipment';
import reportSchedulerService from './reportSchedulerService';
import reportTemplateService from './reportTemplateService';
import { generatePDF } from '../utils/pdfGenerator';
import { generateExcel } from '../utils/excelGenerator';
import { generateCSV } from '../utils/csvGenerator';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import path from 'path';
import fs from 'fs';
import { SettingsService } from './settingsService';

const retryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoff: true
};

const settingsService = new SettingsService();

interface ReportData {
    title: string;
    generatedAt: Date;
    data: any;
}

export async function generateReport(report: IReport): Promise<IReport> {
  try {
    const data = await generateReportData(report);
    const file = await generateReportFile(report.format, data);

    await Report.findByIdAndUpdate(report._id, {
      status: 'completed',
      generatedAt: new Date(),
      data: file
    });

    if (report.schedule?.recipients?.length) {
      await settingsService.sendEmail({
        to: report.schedule.recipients,
        subject: `Report: ${report.title}`,
        text: `Your requested report "${report.title}" is ready.`,
        attachments: [{
          filename: `${report.title}.${report.format}`,
          content: file
        }]
      });
    }

    logger.info(`Report ${report._id} generated successfully`);
    return report;
  } catch (error) {
    logger.error('Failed to generate report:', error);
    await Report.findByIdAndUpdate(report._id, {
      status: 'failed',
      lastErrorAt: new Date()
    });
    throw error;
  }
}

async function generateReportData(report: IReport): Promise<ReportData> {
  switch (report.type) {
    case 'equipment_status':
      return generateEquipmentStatusData();
    case 'decommission_progress':
      return generateDecommissionProgressData();
    case 'rack_utilization':
      return generateRackUtilizationData(report);
    case 'power_consumption':
      return generatePowerConsumptionData(report);
    case 'inventory_valuation':
      return generateInventoryValuationData(report);
    case 'maintenance_schedule':
      return generateMaintenanceScheduleData(report);
    case 'risk_assessment':
      return generateRiskAssessmentData(report);
    case 'cost_analysis':
      return generateCostAnalysisData(report);
    case 'compliance_report':
      return generateComplianceReportData(report);
    default:
      throw new Error(`Unsupported report type: ${report.type}`);
  }
}

async function generateEquipmentStatusData(): Promise<ReportData> {
  const equipment = await Equipment.find({});
  const statusCounts = equipment.reduce((acc: Record<string, number>, e: IEquipment) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  return {
    title: 'Equipment Status Report',
    generatedAt: new Date(),
    data: {
      totalEquipment: equipment.length,
      statusDistribution: statusCounts,
      equipment: equipment.map(e => ({
        name: e.name,
        type: e.type,
        status: e.status,
        location: e.location,
        lastUpdated: e.lastUpdated
      }))
    }
  };
}

async function generateDecommissionProgressData(): Promise<ReportData> {
  const equipment = await Equipment.find({
    status: { $in: ['ready_for_decommission', 'decommissioned'] }
  });

  const totalEquipment = await Equipment.countDocuments();
  const decommissionedCount = equipment.filter(e => e.status === 'decommissioned').length;
  const readyCount = equipment.filter(e => e.status === 'ready_for_decommission').length;

  return {
    title: 'Decommission Progress Report',
    generatedAt: new Date(),
    data: {
      totalEquipment,
      decommissionedCount,
      readyCount,
      progressPercentage: (decommissionedCount / totalEquipment) * 100,
      equipment: equipment.map(e => ({
        name: e.name,
        type: e.type,
        status: e.status,
        location: e.location,
        lastUpdated: e.lastUpdated
      }))
    }
  };
}

async function generateRackUtilizationData(report: IReport): Promise<any> {
  const equipment = await Equipment.find();
  
  // Group equipment by rack
  const rackUtilization = await Equipment.aggregate([
    {
      $group: {
        _id: '$rack',
        totalUnits: { $sum: 1 },
        totalPower: { $sum: '$powerConsumption' },
        equipment: {
          $push: {
            name: '$name',
            type: '$type',
            status: '$status',
            units: '$units',
            powerConsumption: '$powerConsumption'
          }
        }
      }
    },
    {
      $project: {
        rack: '$_id',
        totalUnits: 1,
        totalPower: 1,
        utilization: {
          $multiply: [
            { $divide: ['$totalUnits', 42] }, // Assuming 42U per rack
            100
          ]
        },
        equipment: 1,
        _id: 0
      }
    }
  ]);

  return {
    totalRacks: rackUtilization.length,
    averageUtilization: rackUtilization.reduce((acc, rack) => acc + rack.utilization, 0) / rackUtilization.length,
    racks: rackUtilization
  };
}

async function generatePowerConsumptionData(report: IReport): Promise<any> {
  const { startDate, endDate } = report.parameters;
  
  const powerData = await Equipment.aggregate([
    {
      $match: {
        updatedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' }
        },
        totalPower: { $sum: '$powerConsumption' },
        equipmentCount: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1
      }
    }
  ]);

  return {
    period: {
      start: startDate,
      end: endDate
    },
    totalPowerConsumption: powerData.reduce((acc, month) => acc + month.totalPower, 0),
    monthlyData: powerData.map(month => ({
      period: `${month._id.year}-${month._id.month}`,
      powerConsumption: month.totalPower,
      equipmentCount: month.equipmentCount
    }))
  };
}

async function generateInventoryValuationData(report: IReport): Promise<any> {
  const equipment = await Equipment.find();
  
  const valuation = await Equipment.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        averageAge: {
          $avg: {
            $divide: [
              { $subtract: ['$updatedAt', '$purchaseDate'] },
              365 * 24 * 60 * 60 * 1000 // Convert to years
            ]
          }
        }
      }
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        totalValue: 1,
        averageAge: 1,
        _id: 0
      }
    }
  ]);

  return {
    totalEquipment: equipment.length,
    totalValue: valuation.reduce((acc, type) => acc + type.totalValue, 0),
    byType: valuation,
    depreciation: calculateDepreciation(valuation)
  };
}

async function generateMaintenanceScheduleData(report: IReport): Promise<any> {
  const { startDate, endDate } = report.parameters;
  
  const maintenanceData = await Equipment.aggregate([
    {
      $match: {
        'maintenance.nextDue': {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $project: {
        name: 1,
        type: 1,
        status: 1,
        maintenance: {
          nextDue: 1,
          frequency: 1,
          lastPerformed: 1
        }
      }
    },
    {
      $sort: {
        'maintenance.nextDue': 1
      }
    }
  ]);

  return {
    period: {
      start: startDate,
      end: endDate
    },
    totalMaintenanceTasks: maintenanceData.length,
    tasks: maintenanceData.map(equipment => ({
      name: equipment.name,
      type: equipment.type,
      status: equipment.status,
      nextDue: equipment.maintenance.nextDue,
      frequency: equipment.maintenance.frequency,
      lastPerformed: equipment.maintenance.lastPerformed,
      overdue: new Date(equipment.maintenance.nextDue) < new Date()
    }))
  };
}

async function generateRiskAssessmentData(report: IReport): Promise<any> {
  const equipment = await Equipment.find();
  
  const riskAssessment = await Equipment.aggregate([
    {
      $group: {
        _id: '$riskLevel',
        count: { $sum: 1 },
        equipment: {
          $push: {
            name: '$name',
            type: '$type',
            status: '$status',
            riskFactors: '$riskFactors'
          }
        }
      }
    },
    {
      $project: {
        riskLevel: '$_id',
        count: 1,
        equipment: 1,
        _id: 0
      }
    }
  ]);

  return {
    totalEquipment: equipment.length,
    riskDistribution: riskAssessment,
    criticalItems: equipment.filter(e => e.riskLevel === 'high'),
    recommendations: generateRiskRecommendations(riskAssessment)
  };
}

async function generateCostAnalysisData(report: IReport): Promise<any> {
  const { startDate, endDate } = report.parameters;
  
  const costData = await Equipment.aggregate([
    {
      $match: {
        updatedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalCost: { $sum: '$value' },
        maintenanceCost: { $sum: '$maintenance.cost' },
        decommissioningCost: { $sum: '$decommissioning.cost' }
      }
    },
    {
      $project: {
        type: '$_id',
        count: 1,
        totalCost: 1,
        maintenanceCost: 1,
        decommissioningCost: 1,
        _id: 0
      }
    }
  ]);

  return {
    period: {
      start: startDate,
      end: endDate
    },
    totalCost: costData.reduce((acc, type) => acc + type.totalCost, 0),
    totalMaintenanceCost: costData.reduce((acc, type) => acc + type.maintenanceCost, 0),
    totalDecommissioningCost: costData.reduce((acc, type) => acc + type.decommissioningCost, 0),
    byType: costData,
    costTrends: calculateCostTrends(costData)
  };
}

async function generateComplianceReportData(report: IReport): Promise<any> {
  const equipment = await Equipment.find();
  
  const complianceData = await Equipment.aggregate([
    {
      $group: {
        _id: '$compliance.status',
        count: { $sum: 1 },
        equipment: {
          $push: {
            name: '$name',
            type: '$type',
            status: '$status',
            compliance: '$compliance'
          }
        }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        equipment: 1,
        _id: 0
      }
    }
  ]);

  return {
    totalEquipment: equipment.length,
    complianceStatus: complianceData,
    nonCompliantItems: equipment.filter(e => e.compliance.status !== 'compliant'),
    recommendations: generateComplianceRecommendations(complianceData)
  };
}

// Helper functions
function calculateDepreciation(valuation: any[]): any {
  return valuation.map(type => ({
    type: type.type,
    currentValue: type.totalValue * Math.pow(0.9, type.averageAge), // 10% annual depreciation
    depreciationRate: 10,
    yearsDepreciated: type.averageAge
  }));
}

function calculateCostTrends(costData: any[]): any {
  // Implementation for cost trend analysis
  return {
    maintenanceTrend: 'increasing',
    decommissioningTrend: 'stable',
    recommendations: []
  };
}

function generateRiskRecommendations(riskAssessment: any[]): string[] {
  const recommendations: string[] = [];
  
  riskAssessment.forEach(level => {
    if (level.riskLevel === 'high') {
      recommendations.push(`Address ${level.count} high-risk items immediately`);
    }
  });
  
  return recommendations;
}

function generateComplianceRecommendations(complianceData: any[]): string[] {
  const recommendations: string[] = [];
  
  complianceData.forEach(status => {
    if (status.status !== 'compliant') {
      recommendations.push(`Review ${status.count} non-compliant items`);
    }
  });
  
  return recommendations;
}

async function generateReportFile(format: string, data: ReportData): Promise<Buffer> {
  switch (format.toLowerCase()) {
    case 'pdf':
      return generatePDF(data);
    case 'excel':
      return generateExcel(data);
    case 'csv':
      return Buffer.from(await generateCSV(data.data.equipment, {
        headers: ['name', 'type', 'status', 'location', 'lastUpdated']
      }));
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

export async function scheduleReport(report: IReport): Promise<IReport> {
  try {
    const updatedReport = await Report.findByIdAndUpdate(
      report._id,
      { 
        schedule: report.schedule,
        status: 'scheduled'
      },
      { new: true }
    );

    reportSchedulerService.scheduleReport(updatedReport);
    logger.info(`Report ${report._id} scheduled successfully`);
    return updatedReport;
  } catch (error) {
    logger.error(`Error scheduling report ${report._id}:`, error);
    throw error;
  }
}

export async function cancelScheduledReport(reportId: string): Promise<void> {
  try {
    await Report.findByIdAndUpdate(
      reportId,
      { 
        $unset: { schedule: 1 },
        status: 'cancelled'
      }
    );

    reportSchedulerService.cancelSchedule(reportId);
    logger.info(`Report ${reportId} schedule cancelled successfully`);
  } catch (error) {
    logger.error(`Error cancelling report schedule ${reportId}:`, error);
    throw error;
  }
}

export async function getScheduledReports(): Promise<IReport[]> {
  try {
    return await Report.find({
      'schedule.frequency': { $exists: true }
    });
  } catch (error) {
    logger.error('Error getting scheduled reports:', error);
    throw error;
  }
}

export async function getReportStatus(reportId: string): Promise<{
  status: string;
  error?: string;
  lastErrorAt?: Date;
  generatedAt?: Date;
}> {
  try {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    return {
      status: report.status,
      error: report.error,
      lastErrorAt: report.lastErrorAt,
      generatedAt: report.generatedAt
    };
  } catch (error) {
    logger.error(`Error getting report status ${reportId}:`, error);
    throw error;
  }
}

export async function retryFailedReport(reportId: string): Promise<IReport> {
  try {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    if (report.status !== 'failed') {
      throw new Error(`Report ${reportId} is not in failed state`);
    }

    // Reset error information
    report.error = undefined;
    report.lastErrorAt = undefined;
    report.status = 'pending';
    await report.save();

    // Regenerate report
    return await generateReport(report);
  } catch (error) {
    logger.error(`Error retrying failed report ${reportId}:`, error);
    throw error;
  }
} 