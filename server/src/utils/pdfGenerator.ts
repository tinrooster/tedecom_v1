import PDFDocument from 'pdfkit';
import { IReport } from '../models/Report';
import path from 'path';
import fs from 'fs';

export async function generatePDF(report: IReport, data: any): Promise<string> {
  const doc = new PDFDocument();
  const fileName = `${report._id}_${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../../uploads/reports', fileName);
  
  // Ensure directory exists
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  
  // Create write stream
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Add header
  doc.fontSize(20).text(report.title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
  doc.moveDown();

  // Add report content based on type
  switch (report.type) {
    case 'equipment_status':
      generateEquipmentStatusPDF(doc, data);
      break;
    case 'decommission_progress':
      generateDecommissionProgressPDF(doc, data);
      break;
    case 'rack_utilization':
      generateRackUtilizationPDF(doc, data);
      break;
    case 'power_consumption':
      generatePowerConsumptionPDF(doc, data);
      break;
    case 'inventory_valuation':
      generateInventoryValuationPDF(doc, data);
      break;
    case 'maintenance_schedule':
      generateMaintenanceSchedulePDF(doc, data);
      break;
    case 'risk_assessment':
      generateRiskAssessmentPDF(doc, data);
      break;
    case 'cost_analysis':
      generateCostAnalysisPDF(doc, data);
      break;
    case 'compliance_report':
      generateComplianceReportPDF(doc, data);
      break;
  }

  // Finalize PDF
  doc.end();

  // Wait for write stream to finish
  await new Promise((resolve) => writeStream.on('finish', resolve));

  return filePath;
}

function generateEquipmentStatusPDF(doc: PDFKit.PDFDocument, data: any): void {
  // Summary section
  doc.fontSize(16).text('Summary');
  doc.moveDown();
  doc.fontSize(12).text(`Total Equipment: ${data.totalEquipment}`);
  doc.text(`Active: ${data.activeCount}`);
  doc.text(`Pending: ${data.pendingCount}`);
  doc.text(`Decommissioned: ${data.decommissionedCount}`);
  doc.moveDown();

  // Equipment table
  doc.fontSize(14).text('Equipment Details');
  doc.moveDown();

  // Table headers
  const headers = ['Name', 'Type', 'Status', 'Last Updated'];
  const columnWidths = [150, 100, 100, 150];
  
  // Draw headers
  let x = 50;
  headers.forEach((header, i) => {
    doc.text(header, x, doc.y);
    x += columnWidths[i];
  });
  doc.moveDown();

  // Draw rows
  data.equipment.forEach((item: any) => {
    x = 50;
    doc.text(item.name, x);
    x += columnWidths[0];
    doc.text(item.type, x);
    x += columnWidths[1];
    doc.text(item.status, x);
    x += columnWidths[2];
    doc.text(new Date(item.lastUpdated).toLocaleString(), x);
    doc.moveDown();
  });
}

function generateDecommissionProgressPDF(doc: PDFKit.PDFDocument, data: any): void {
  // Overall progress
  doc.fontSize(16).text('Overall Progress');
  doc.moveDown();
  doc.fontSize(12).text(`Progress: ${data.overallProgress.toFixed(1)}%`);
  doc.moveDown();

  // Recent activities
  doc.fontSize(14).text('Recent Activities');
  doc.moveDown();
  data.recentActivities.forEach((activity: any) => {
    doc.text(`${new Date(activity.date).toLocaleString()}: ${activity.description}`);
    doc.moveDown();
  });

  // Department progress
  doc.fontSize(14).text('Progress by Department');
  doc.moveDown();
  data.departmentProgress.forEach((dept: any) => {
    doc.text(`${dept.name}: ${dept.progress.toFixed(1)}% - ${dept.status}`);
    doc.moveDown();
  });
}

function generateRackUtilizationPDF(doc: PDFKit.PDFDocument, data: any): void {
  // Summary
  doc.fontSize(16).text('Rack Utilization Summary');
  doc.moveDown();
  doc.fontSize(12).text(`Total Racks: ${data.totalRacks}`);
  doc.text(`Average Utilization: ${data.averageUtilization.toFixed(1)}%`);
  doc.moveDown();

  // Rack details
  doc.fontSize(14).text('Rack Details');
  doc.moveDown();
  data.racks.forEach((rack: any) => {
    doc.text(`Rack: ${rack.rack}`);
    doc.text(`Units Used: ${rack.totalUnits}/42`);
    doc.text(`Utilization: ${rack.utilization.toFixed(1)}%`);
    doc.text(`Total Power: ${rack.totalPower}W`);
    doc.moveDown();
  });
}

function generatePowerConsumptionPDF(doc: PDFKit.PDFDocument, data: any): void {
  // Summary
  doc.fontSize(16).text('Power Consumption Report');
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}`);
  doc.text(`Total Power Consumption: ${data.totalPowerConsumption}W`);
  doc.moveDown();

  // Monthly data
  doc.fontSize(14).text('Monthly Consumption');
  doc.moveDown();
  data.monthlyData.forEach((month: any) => {
    doc.text(`${month.period}: ${month.powerConsumption}W (${month.equipmentCount} equipment)`);
    doc.moveDown();
  });
}

function generateInventoryValuationPDF(doc: PDFKit.PDFDocument, data: any): void {
  // Summary
  doc.fontSize(16).text('Inventory Valuation Report');
  doc.moveDown();
  doc.fontSize(12).text(`Total Equipment: ${data.totalEquipment}`);
  doc.text(`Total Value: $${data.totalValue.toLocaleString()}`);
  doc.moveDown();

  // By type
  doc.fontSize(14).text('Valuation by Type');
  doc.moveDown();
  data.byType.forEach((type: any) => {
    doc.text(`${type.type}:`);
    doc.text(`Count: ${type.count}`);
    doc.text(`Value: $${type.totalValue.toLocaleString()}`);
    doc.text(`Average Age: ${type.averageAge.toFixed(1)} years`);
    doc.moveDown();
  });

  // Depreciation
  doc.fontSize(14).text('Depreciation Analysis');
  doc.moveDown();
  data.depreciation.forEach((dep: any) => {
    doc.text(`${dep.type}:`);
    doc.text(`Current Value: $${dep.currentValue.toLocaleString()}`);
    doc.text(`Depreciation Rate: ${dep.depreciationRate}%`);
    doc.text(`Years Depreciated: ${dep.yearsDepreciated.toFixed(1)}`);
    doc.moveDown();
  });
}

function generateMaintenanceSchedulePDF(doc: PDFKit.PDFDocument, data: any): void {
  // Summary
  doc.fontSize(16).text('Maintenance Schedule Report');
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}`);
  doc.text(`Total Maintenance Tasks: ${data.totalMaintenanceTasks}`);
  doc.moveDown();

  // Tasks
  doc.fontSize(14).text('Scheduled Maintenance Tasks');
  doc.moveDown();
  data.tasks.forEach((task: any) => {
    doc.text(`${task.name} (${task.type})`);
    doc.text(`Status: ${task.status}`);
    doc.text(`Next Due: ${new Date(task.nextDue).toLocaleDateString()}`);
    doc.text(`Frequency: ${task.frequency}`);
    doc.text(`Last Performed: ${task.lastPerformed ? new Date(task.lastPerformed).toLocaleDateString() : 'Never'}`);
    doc.text(`Overdue: ${task.overdue ? 'Yes' : 'No'}`);
    doc.moveDown();
  });
}

function generateRiskAssessmentPDF(doc: PDFKit.PDFDocument, data: any): void {
  // Summary
  doc.fontSize(16).text('Risk Assessment Report');
  doc.moveDown();
  doc.fontSize(12).text(`Total Equipment: ${data.totalEquipment}`);
  doc.moveDown();

  // Risk distribution
  doc.fontSize(14).text('Risk Distribution');
  doc.moveDown();
  data.riskDistribution.forEach((risk: any) => {
    doc.text(`${risk.riskLevel}: ${risk.count} items`);
    doc.moveDown();
  });

  // Critical items
  doc.fontSize(14).text('Critical Items');
  doc.moveDown();
  data.criticalItems.forEach((item: any) => {
    doc.text(`${item.name} (${item.type})`);
    doc.text(`Status: ${item.status}`);
    doc.text(`Risk Factors: ${item.riskFactors.join(', ')}`);
    doc.moveDown();
  });

  // Recommendations
  doc.fontSize(14).text('Recommendations');
  doc.moveDown();
  data.recommendations.forEach((rec: string) => {
    doc.text(`• ${rec}`);
    doc.moveDown();
  });
}

function generateCostAnalysisPDF(doc: PDFKit.PDFDocument, data: any): void {
  // Summary
  doc.fontSize(16).text('Cost Analysis Report');
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${new Date(data.period.start).toLocaleDateString()} - ${new Date(data.period.end).toLocaleDateString()}`);
  doc.text(`Total Cost: $${data.totalCost.toLocaleString()}`);
  doc.text(`Total Maintenance Cost: $${data.totalMaintenanceCost.toLocaleString()}`);
  doc.text(`Total Decommissioning Cost: $${data.totalDecommissioningCost.toLocaleString()}`);
  doc.moveDown();

  // By type
  doc.fontSize(14).text('Costs by Type');
  doc.moveDown();
  data.byType.forEach((type: any) => {
    doc.text(`${type.type}:`);
    doc.text(`Count: ${type.count}`);
    doc.text(`Total Cost: $${type.totalCost.toLocaleString()}`);
    doc.text(`Maintenance Cost: $${type.maintenanceCost.toLocaleString()}`);
    doc.text(`Decommissioning Cost: $${type.decommissioningCost.toLocaleString()}`);
    doc.moveDown();
  });

  // Trends
  doc.fontSize(14).text('Cost Trends');
  doc.moveDown();
  doc.text(`Maintenance Trend: ${data.costTrends.maintenanceTrend}`);
  doc.text(`Decommissioning Trend: ${data.costTrends.decommissioningTrend}`);
  doc.moveDown();
}

function generateComplianceReportPDF(doc: PDFKit.PDFDocument, data: any): void {
  // Summary
  doc.fontSize(16).text('Compliance Report');
  doc.moveDown();
  doc.fontSize(12).text(`Total Equipment: ${data.totalEquipment}`);
  doc.moveDown();

  // Compliance status
  doc.fontSize(14).text('Compliance Status');
  doc.moveDown();
  data.complianceStatus.forEach((status: any) => {
    doc.text(`${status.status}: ${status.count} items`);
    doc.moveDown();
  });

  // Non-compliant items
  doc.fontSize(14).text('Non-Compliant Items');
  doc.moveDown();
  data.nonCompliantItems.forEach((item: any) => {
    doc.text(`${item.name} (${item.type})`);
    doc.text(`Status: ${item.status}`);
    doc.text(`Compliance Issues: ${item.compliance.issues.join(', ')}`);
    doc.moveDown();
  });

  // Recommendations
  doc.fontSize(14).text('Recommendations');
  doc.moveDown();
  data.recommendations.forEach((rec: string) => {
    doc.text(`• ${rec}`);
    doc.moveDown();
  });
} 