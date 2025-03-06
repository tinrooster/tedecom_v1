import schedule from 'node-schedule';
import { Report, IReport } from '../models/Report';
import { logger } from '../utils/logger';
import settingsService from './settingsService';
import { generateReport } from './reportService';
import path from 'path';
import fs from 'fs';

interface ScheduleOptions {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time?: string;
    recipients?: string[];
}

export class ReportSchedulerService {
    private jobs: Map<string, schedule.Job>;

    constructor() {
        this.jobs = new Map();
        this.initializeScheduledReports();
    }

    private async initializeScheduledReports(): Promise<void> {
        try {
            const reports = await Report.find({ 'schedule': { $exists: true } });
            reports.forEach(report => this.scheduleReport(report));
        } catch (error) {
            logger.error('Failed to initialize scheduled reports:', error);
        }
    }

    async scheduleReport(report: IReport): Promise<void> {
        if (!report.schedule) {
            throw new Error('Report schedule is required');
        }

        const { frequency, dayOfWeek, dayOfMonth, time } = report.schedule;
        const cronExpression = this.getCronExpression(frequency, dayOfWeek, dayOfMonth, time);

        const job = schedule.scheduleJob(cronExpression, async () => {
            try {
                await this.generateReport(report);
            } catch (error) {
                logger.error(`Failed to generate scheduled report ${report._id}:`, error);
            }
        });

        this.jobs.set(report._id.toString(), job);
    }

    private getCronExpression(
        frequency: string,
        dayOfWeek?: number,
        dayOfMonth?: number,
        time?: string
    ): string {
        const [hours = '0', minutes = '0'] = (time || '0:0').split(':');

        switch (frequency) {
            case 'daily':
                return `${minutes} ${hours} * * *`;
            case 'weekly':
                return `${minutes} ${hours} * * ${dayOfWeek || 0}`;
            case 'monthly':
                return `${minutes} ${hours} ${dayOfMonth || 1} * *`;
            case 'quarterly':
                return `${minutes} ${hours} 1 */3 *`;
            case 'yearly':
                return `${minutes} ${hours} 1 1 *`;
            default:
                throw new Error(`Invalid frequency: ${frequency}`);
        }
    }

    private async generateReport(report: IReport): Promise<void> {
        try {
            // TODO: Implement report generation
            logger.info(`Generated scheduled report ${report._id}`);
        } catch (error) {
            logger.error(`Failed to generate report ${report._id}:`, error);
            throw error;
        }
    }

    cancelScheduledReport(reportId: string): void {
        const job = this.jobs.get(reportId);
        if (job) {
            job.cancel();
            this.jobs.delete(reportId);
        }
    }

    cleanup(): void {
        this.jobs.forEach(job => job.cancel());
        this.jobs.clear();
    }

    private async sendReportEmail(report: IReport): Promise<void> {
        if (!report.schedule?.recipients || report.schedule.recipients.length === 0) {
            return;
        }

        const emailTemplate = await this.getEmailTemplate(report.type);
        const emailContent = this.generateEmailContent(emailTemplate, report);

        await settingsService.sendEmail(
            report.schedule.recipients.join(', '),
            `Scheduled Report: ${report.title}`,
            emailContent
        );
    }

    private async getEmailTemplate(reportType: IReport['type']): Promise<string> {
        const templatePath = path.join(__dirname, '../templates/emails', `${reportType}.html`);
        
        try {
            return await fs.promises.readFile(templatePath, 'utf-8');
        } catch (error) {
            console.error(`Error reading email template for ${reportType}:`, error);
            return this.getDefaultEmailTemplate();
        }
    }

    private getDefaultEmailTemplate(): string {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
                        .content { padding: 20px; }
                        .footer { text-align: center; padding: 20px; color: #6c757d; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>{{title}}</h2>
                            <p>Generated on: {{generatedAt}}</p>
                        </div>
                        <div class="content">
                            {{content}}
                        </div>
                        <div class="footer">
                            <p>This is an automated report from the Server Room Decommissioning System.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }

    private generateEmailContent(template: string, report: IReport): string {
        return template
            .replace('{{title}}', report.title)
            .replace('{{generatedAt}}', new Date().toLocaleString())
            .replace('{{content}}', this.formatReportContent(report));
    }

    private formatReportContent(report: IReport): string {
        // Format report data based on type and format
        switch (report.format) {
            case 'json':
                return `<pre>${JSON.stringify(report.data, null, 2)}</pre>`;
            case 'csv':
                return `<pre>${report.data}</pre>`;
            case 'pdf':
                return `<p>PDF report has been generated and attached to this email.</p>`;
            case 'excel':
                return `<p>Excel report has been generated and attached to this email.</p>`;
            default:
                return `<p>Report data is not available in the email format.</p>`;
        }
    }
} 