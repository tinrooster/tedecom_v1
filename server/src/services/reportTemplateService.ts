import { IReportTemplate } from '../models/ReportTemplate';
import ReportTemplate from '../models/ReportTemplate';
import { IReport } from '../models/Report';
import { generatePDF } from '../utils/pdfGenerator';
import { generateExcel } from '../utils/excelGenerator';
import { generateCSV } from '../utils/csvGenerator';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';
import path from 'path';
import fs from 'fs';

const retryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoff: true
};

class ReportTemplateService {
  async getTemplate(
    type: string,
    format: string,
    userId: string
  ): Promise<IReportTemplate> {
    try {
      // Try to get user's custom template first
      let template = await ReportTemplate.findOne({
        type,
        format,
        createdBy: userId,
        isDefault: false
      });

      // If no custom template, get the default template
      if (!template) {
        template = await ReportTemplate.findOne({
          type,
          format,
          isDefault: true
        });
      }

      if (!template) {
        throw new Error(`No template found for type ${type} and format ${format}`);
      }

      return template;
    } catch (error) {
      logger.error('Error getting template:', error);
      throw error;
    }
  }

  async createTemplate(template: Partial<IReportTemplate>): Promise<IReportTemplate> {
    try {
      const newTemplate = new ReportTemplate(template);
      await newTemplate.save();
      logger.info(`Created new template: ${newTemplate._id}`);
      return newTemplate;
    } catch (error) {
      logger.error('Error creating template:', error);
      throw error;
    }
  }

  async updateTemplate(
    templateId: string,
    updates: Partial<IReportTemplate>
  ): Promise<IReportTemplate> {
    try {
      const template = await ReportTemplate.findByIdAndUpdate(
        templateId,
        updates,
        { new: true }
      );
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }
      logger.info(`Updated template: ${templateId}`);
      return template;
    } catch (error) {
      logger.error('Error updating template:', error);
      throw error;
    }
  }

  async deleteTemplate(templateId: string): Promise<void> {
    try {
      const template = await ReportTemplate.findByIdAndDelete(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }
      logger.info(`Deleted template: ${templateId}`);
    } catch (error) {
      logger.error('Error deleting template:', error);
      throw error;
    }
  }

  async setDefaultTemplate(templateId: string): Promise<IReportTemplate> {
    try {
      const template = await ReportTemplate.findById(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Remove default flag from other templates of same type and format
      await ReportTemplate.updateMany(
        {
          type: template.type,
          format: template.format,
          isDefault: true
        },
        { isDefault: false }
      );

      // Set this template as default
      template.isDefault = true;
      await template.save();

      logger.info(`Set template ${templateId} as default`);
      return template;
    } catch (error) {
      logger.error('Error setting default template:', error);
      throw error;
    }
  }

  async generateReportWithRetry(
    report: IReport,
    data: any,
    template: IReportTemplate
  ): Promise<string> {
    return retry(
      () => this.generateReport(report, data, template),
      retryOptions
    );
  }

  private async generateReport(
    report: IReport,
    data: any,
    template: IReportTemplate
  ): Promise<string> {
    const outputDir = path.join(__dirname, '../../reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fileName = `${report._id}_${Date.now()}.${report.format}`;
    const filePath = path.join(outputDir, fileName);

    try {
      switch (report.format) {
        case 'pdf':
          await this.generatePDFWithTemplate(data, template, filePath);
          break;
        case 'excel':
          await this.generateExcelWithTemplate(data, template, filePath);
          break;
        case 'csv':
          await this.generateCSVWithTemplate(data, template, filePath);
          break;
        default:
          throw new Error(`Unsupported format: ${report.format}`);
      }

      return filePath;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  private async generatePDFWithTemplate(
    data: any,
    template: IReportTemplate,
    filePath: string
  ): Promise<void> {
    const { settings } = template;
    const options = {
      header: settings.header,
      styling: settings.styling,
      sections: settings.sections,
      tableSettings: settings.tableSettings,
      pageSettings: settings.pageSettings
    };

    await generatePDF(data, options, filePath);
  }

  private async generateExcelWithTemplate(
    data: any,
    template: IReportTemplate,
    filePath: string
  ): Promise<void> {
    const { settings } = template;
    const options = {
      header: settings.header,
      styling: settings.styling,
      tableSettings: settings.tableSettings
    };

    await generateExcel(data, options, filePath);
  }

  private async generateCSVWithTemplate(
    data: any,
    template: IReportTemplate,
    filePath: string
  ): Promise<void> {
    const { settings } = template;
    const options = {
      header: settings.header,
      tableSettings: settings.tableSettings
    };

    await generateCSV(data, options, filePath);
  }
}

export default new ReportTemplateService(); 