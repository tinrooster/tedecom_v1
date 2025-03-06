import ExcelJS from 'exceljs';
import { IReport } from '../models/Report';
import path from 'path';
import fs from 'fs';

export async function generateExcel(report: IReport, data: any): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  const fileName = `${report._id}_${Date.now()}.xlsx`;
  const filePath = path.join(__dirname, '../../uploads/reports', fileName);
  
  // Ensure directory exists
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

  // Add header sheet
  const headerSheet = workbook.addWorksheet('Report Info');
  headerSheet.columns = [
    { header: 'Field', key: 'field', width: 20 },
    { header: 'Value', key: 'value', width: 40 }
  ];
  headerSheet.addRows([
    { field: 'Report Title', value: report.title },
    { field: 'Report Type', value: report.type },
    { field: 'Generated On', value: new Date().toLocaleString() },
    { field: 'Format', value: report.format }
  ]);

  // Add data sheet based on report type
  switch (report.type) {
    case 'equipment_status':
      generateEquipmentStatusExcel(workbook, data);
      break;
    case 'decommission_progress':
      generateDecommissionProgressExcel(workbook, data);
      break;
    case 'rack_utilization':
      generateRackUtilizationExcel(workbook, data);
      break;
    case 'power_consumption':
      generatePowerConsumptionExcel(workbook, data);
      break;
    case 'inventory_valuation':
      generateInventoryValuationExcel(workbook, data);
      break;
    case 'maintenance_schedule':
      generateMaintenanceScheduleExcel(workbook, data);
      break;
    case 'risk_assessment':
      generateRiskAssessmentExcel(workbook, data);
      break;
    case 'cost_analysis':
      generateCostAnalysisExcel(workbook, data);
      break;
    case 'compliance_report':
      generateComplianceReportExcel(workbook, data);
      break;
  }

  // Save workbook
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

function generateEquipmentStatusExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  summarySheet.addRows([
    { metric: 'Total Equipment', value: data.totalEquipment },
    { metric: 'Active', value: data.activeCount },
    { metric: 'Pending', value: data.pendingCount },
    { metric: 'Decommissioned', value: data.decommissionedCount }
  ]);

  // Equipment details sheet
  const detailsSheet = workbook.addWorksheet('Equipment Details');
  detailsSheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Last Updated', key: 'lastUpdated', width: 20 }
  ];
  detailsSheet.addRows(data.equipment.map((item: any) => ({
    name: item.name,
    type: item.type,
    status: item.status,
    lastUpdated: new Date(item.lastUpdated).toLocaleString()
  })));
}

function generateDecommissionProgressExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Overall progress sheet
  const progressSheet = workbook.addWorksheet('Overall Progress');
  progressSheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  progressSheet.addRows([
    { metric: 'Overall Progress', value: `${data.overallProgress.toFixed(1)}%` }
  ]);

  // Recent activities sheet
  const activitiesSheet = workbook.addWorksheet('Recent Activities');
  activitiesSheet.columns = [
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Description', key: 'description', width: 50 }
  ];
  activitiesSheet.addRows(data.recentActivities.map((activity: any) => ({
    date: new Date(activity.date).toLocaleString(),
    description: activity.description
  })));

  // Department progress sheet
  const deptSheet = workbook.addWorksheet('Department Progress');
  deptSheet.columns = [
    { header: 'Department', key: 'name', width: 30 },
    { header: 'Progress', key: 'progress', width: 15 },
    { header: 'Status', key: 'status', width: 15 }
  ];
  deptSheet.addRows(data.departmentProgress.map((dept: any) => ({
    name: dept.name,
    progress: `${dept.progress.toFixed(1)}%`,
    status: dept.status
  })));
}

function generateRackUtilizationExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  summarySheet.addRows([
    { metric: 'Total Racks', value: data.totalRacks },
    { metric: 'Average Utilization', value: `${data.averageUtilization.toFixed(1)}%` }
  ]);

  // Rack details sheet
  const detailsSheet = workbook.addWorksheet('Rack Details');
  detailsSheet.columns = [
    { header: 'Rack', key: 'rack', width: 15 },
    { header: 'Units Used', key: 'units', width: 15 },
    { header: 'Utilization', key: 'utilization', width: 15 },
    { header: 'Total Power', key: 'power', width: 15 }
  ];
  detailsSheet.addRows(data.racks.map((rack: any) => ({
    rack: rack.rack,
    units: `${rack.totalUnits}/42`,
    utilization: `${rack.utilization.toFixed(1)}%`,
    power: `${rack.totalPower}W`
  })));
}

function generatePowerConsumptionExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  summarySheet.addRows([
    { metric: 'Period', value: `${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}` },
    { metric: 'Total Power Consumption', value: `${data.totalPowerConsumption}W` }
  ]);

  // Monthly data sheet
  const monthlySheet = workbook.addWorksheet('Monthly Consumption');
  monthlySheet.columns = [
    { header: 'Period', key: 'period', width: 15 },
    { header: 'Power Consumption', key: 'power', width: 20 },
    { header: 'Equipment Count', key: 'count', width: 15 }
  ];
  monthlySheet.addRows(data.monthlyData.map((month: any) => ({
    period: month.period,
    power: `${month.powerConsumption}W`,
    count: month.equipmentCount
  })));
}

function generateInventoryValuationExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  summarySheet.addRows([
    { metric: 'Total Equipment', value: data.totalEquipment },
    { metric: 'Total Value', value: `$${data.totalValue.toLocaleString()}` }
  ]);

  // By type sheet
  const typeSheet = workbook.addWorksheet('Valuation by Type');
  typeSheet.columns = [
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Count', key: 'count', width: 10 },
    { header: 'Value', key: 'value', width: 15 },
    { header: 'Average Age', key: 'age', width: 15 }
  ];
  typeSheet.addRows(data.byType.map((type: any) => ({
    type: type.type,
    count: type.count,
    value: `$${type.totalValue.toLocaleString()}`,
    age: `${type.averageAge.toFixed(1)} years`
  })));

  // Depreciation sheet
  const depSheet = workbook.addWorksheet('Depreciation Analysis');
  depSheet.columns = [
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Current Value', key: 'value', width: 15 },
    { header: 'Depreciation Rate', key: 'rate', width: 20 },
    { header: 'Years Depreciated', key: 'years', width: 15 }
  ];
  depSheet.addRows(data.depreciation.map((dep: any) => ({
    type: dep.type,
    value: `$${dep.currentValue.toLocaleString()}`,
    rate: `${dep.depreciationRate}%`,
    years: dep.yearsDepreciated.toFixed(1)
  })));
}

function generateMaintenanceScheduleExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  summarySheet.addRows([
    { metric: 'Period', value: `${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}` },
    { metric: 'Total Maintenance Tasks', value: data.totalMaintenanceTasks }
  ]);

  // Tasks sheet
  const tasksSheet = workbook.addWorksheet('Maintenance Tasks');
  tasksSheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Next Due', key: 'nextDue', width: 20 },
    { header: 'Frequency', key: 'frequency', width: 15 },
    { header: 'Last Performed', key: 'lastPerformed', width: 20 },
    { header: 'Overdue', key: 'overdue', width: 10 }
  ];
  tasksSheet.addRows(data.tasks.map((task: any) => ({
    name: task.name,
    type: task.type,
    status: task.status,
    nextDue: new Date(task.nextDue).toLocaleDateString(),
    frequency: task.frequency,
    lastPerformed: task.lastPerformed ? new Date(task.lastPerformed).toLocaleDateString() : 'Never',
    overdue: task.overdue ? 'Yes' : 'No'
  })));
}

function generateRiskAssessmentExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  summarySheet.addRows([
    { metric: 'Total Equipment', value: data.totalEquipment }
  ]);

  // Risk distribution sheet
  const riskSheet = workbook.addWorksheet('Risk Distribution');
  riskSheet.columns = [
    { header: 'Risk Level', key: 'level', width: 15 },
    { header: 'Count', key: 'count', width: 10 }
  ];
  riskSheet.addRows(data.riskDistribution.map((risk: any) => ({
    level: risk.riskLevel,
    count: risk.count
  })));

  // Critical items sheet
  const criticalSheet = workbook.addWorksheet('Critical Items');
  criticalSheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Risk Factors', key: 'factors', width: 50 }
  ];
  criticalSheet.addRows(data.criticalItems.map((item: any) => ({
    name: item.name,
    type: item.type,
    status: item.status,
    factors: item.riskFactors.join(', ')
  })));

  // Recommendations sheet
  const recSheet = workbook.addWorksheet('Recommendations');
  recSheet.columns = [
    { header: 'Recommendation', key: 'rec', width: 70 }
  ];
  recSheet.addRows(data.recommendations.map((rec: string) => ({
    rec
  })));
}

function generateCostAnalysisExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  summarySheet.addRows([
    { metric: 'Period', value: `${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}` },
    { metric: 'Total Cost', value: `$${data.totalCost.toLocaleString()}` },
    { metric: 'Total Maintenance Cost', value: `$${data.totalMaintenanceCost.toLocaleString()}` },
    { metric: 'Total Decommissioning Cost', value: `$${data.totalDecommissioningCost.toLocaleString()}` }
  ]);

  // By type sheet
  const typeSheet = workbook.addWorksheet('Costs by Type');
  typeSheet.columns = [
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Count', key: 'count', width: 10 },
    { header: 'Total Cost', key: 'total', width: 15 },
    { header: 'Maintenance Cost', key: 'maintenance', width: 15 },
    { header: 'Decommissioning Cost', key: 'decommissioning', width: 20 }
  ];
  typeSheet.addRows(data.byType.map((type: any) => ({
    type: type.type,
    count: type.count,
    total: `$${type.totalCost.toLocaleString()}`,
    maintenance: `$${type.maintenanceCost.toLocaleString()}`,
    decommissioning: `$${type.decommissioningCost.toLocaleString()}`
  })));

  // Trends sheet
  const trendsSheet = workbook.addWorksheet('Cost Trends');
  trendsSheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  trendsSheet.addRows([
    { metric: 'Maintenance Trend', value: data.costTrends.maintenanceTrend },
    { metric: 'Decommissioning Trend', value: data.costTrends.decommissioningTrend }
  ]);
}

function generateComplianceReportExcel(workbook: ExcelJS.Workbook, data: any): void {
  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 20 },
    { header: 'Value', key: 'value', width: 15 }
  ];
  summarySheet.addRows([
    { metric: 'Total Equipment', value: data.totalEquipment }
  ]);

  // Compliance status sheet
  const statusSheet = workbook.addWorksheet('Compliance Status');
  statusSheet.columns = [
    { header: 'Status', key: 'status', width: 20 },
    { header: 'Count', key: 'count', width: 10 }
  ];
  statusSheet.addRows(data.complianceStatus.map((status: any) => ({
    status: status.status,
    count: status.count
  })));

  // Non-compliant items sheet
  const nonCompliantSheet = workbook.addWorksheet('Non-Compliant Items');
  nonCompliantSheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Compliance Issues', key: 'issues', width: 50 }
  ];
  nonCompliantSheet.addRows(data.nonCompliantItems.map((item: any) => ({
    name: item.name,
    type: item.type,
    status: item.status,
    issues: item.compliance.issues.join(', ')
  })));

  // Recommendations sheet
  const recSheet = workbook.addWorksheet('Recommendations');
  recSheet.columns = [
    { header: 'Recommendation', key: 'rec', width: 70 }
  ];
  recSheet.addRows(data.recommendations.map((rec: string) => ({
    rec
  })));
} 