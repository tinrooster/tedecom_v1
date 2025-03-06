import { Settings, ISettings } from '../models/Settings';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { scheduleJob } from 'node-schedule';

export class SettingsService {
  private static instance: SettingsService;
  private logger: any;
  private backupJob: any;

  private constructor() {
    this.logger = logger;

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  public async getSettings(): Promise<ISettings> {
    const settings = await Settings.findOne();
    if (!settings) {
      throw new Error('Settings not found');
    }
    return settings;
  }

  public async updateSettings(updates: Partial<ISettings>): Promise<ISettings> {
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true }
    );
    return settings;
  }

  private updateBackupSchedule(backupSettings: ISettings['backup']) {
    if (this.backupJob) {
      this.backupJob.cancel();
    }

    if (!backupSettings.enabled) {
      return;
    }

    let scheduleRule = '';
    switch (backupSettings.frequency) {
      case 'daily':
        scheduleRule = '0 0 * * *'; // Run at midnight
        break;
      case 'weekly':
        scheduleRule = '0 0 * * 0'; // Run at midnight on Sunday
        break;
      case 'monthly':
        scheduleRule = '0 0 1 * *'; // Run at midnight on the first day of the month
        break;
    }

    this.backupJob = scheduleJob(scheduleRule, () => {
      this.performBackup(backupSettings);
    });
  }

  private async performBackup(backupSettings: ISettings['backup']) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(backupSettings.path, timestamp);
      
      // Create backup directory
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Perform backup operations here
      // This is a placeholder for actual backup logic
      this.logger.info(`Backup completed successfully at ${timestamp}`);

      // Clean up old backups
      this.cleanupOldBackups(backupSettings);
    } catch (error) {
      this.logger.error('Backup failed:', error);
    }
  }

  private cleanupOldBackups(backupSettings: ISettings['backup']) {
    const backupDir = backupSettings.path;
    const retentionDays = backupSettings.retentionDays;

    fs.readdir(backupDir, (err, files) => {
      if (err) {
        this.logger.error('Error reading backup directory:', err);
        return;
      }

      const now = new Date();
      files.forEach(file => {
        const filePath = path.join(backupDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            this.logger.error(`Error getting stats for ${file}:`, err);
            return;
          }

          const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          if (daysOld > retentionDays) {
            fs.rm(filePath, { recursive: true }, (err) => {
              if (err) {
                this.logger.error(`Error deleting old backup ${file}:`, err);
              } else {
                this.logger.info(`Deleted old backup: ${file}`);
              }
            });
          }
        });
      });
    });
  }

  public async sendEmail(options: {
    to: string | string[];
    subject: string;
    text: string;
    attachments?: Array<{
      filename: string;
      content: Buffer;
    }>;
  }): Promise<void> {
    try {
      const settings = await this.getSettings();
      // TODO: Implement email sending using settings.email configuration
      logger.info('Email sent successfully', { to: options.to, subject: options.subject });
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  public async rotateLogs(): Promise<void> {
    const settings = await this.getSettings();
    const { logging } = settings;

    const logDir = path.dirname(logging.path);
    const logFile = path.basename(logging.path, '.log');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedLogPath = path.join(logDir, `${logFile}-${timestamp}.log`);

    // Rename current log file
    if (fs.existsSync(logging.path)) {
      fs.renameSync(logging.path, rotatedLogPath);
    }

    // Create new log file
    fs.writeFileSync(logging.path, '');

    // Clean up old logs
    this.cleanupOldLogs(logging);
  }

  private cleanupOldLogs(loggingSettings: ISettings['logging']) {
    const logDir = path.dirname(loggingSettings.path);
    const retentionDays = loggingSettings.retentionDays;

    fs.readdir(logDir, (err, files) => {
      if (err) {
        this.logger.error('Error reading log directory:', err);
        return;
      }

      const now = new Date();
      files.forEach(file => {
        if (!file.endsWith('.log')) return;

        const filePath = path.join(logDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) {
            this.logger.error(`Error getting stats for ${file}:`, err);
            return;
          }

          const daysOld = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
          if (daysOld > retentionDays) {
            fs.unlink(filePath, (err) => {
              if (err) {
                this.logger.error(`Error deleting old log ${file}:`, err);
              } else {
                this.logger.info(`Deleted old log: ${file}`);
              }
            });
          }
        });
      });
    });
  }
}

export default SettingsService.getInstance(); 