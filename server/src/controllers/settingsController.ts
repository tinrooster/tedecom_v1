import { Request, Response } from 'express';
import settingsService from '../services/settingsService';
import { ISettings } from '../models/Settings';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = req.body as Partial<ISettings>;
    const updatedSettings = await settingsService.updateSettings(settings);
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error });
  }
};

export const testEmailSettings = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    await settingsService.sendEmail(
      email,
      'Test Email',
      'This is a test email to verify your email notification settings.'
    );

    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending test email', error });
  }
};

export const performBackup = async (req: Request, res: Response) => {
  try {
    const settings = await settingsService.getSettings();
    if (!settings.backup.enabled) {
      return res.status(400).json({ message: 'Backup is not enabled' });
    }

    // Trigger backup
    await settingsService.updateSettings({
      backup: {
        ...settings.backup,
        enabled: true, // This will trigger the backup
      },
    });

    res.json({ message: 'Backup initiated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error performing backup', error });
  }
};

export const rotateLogs = async (req: Request, res: Response) => {
  try {
    await settingsService.rotateLogs();
    res.json({ message: 'Logs rotated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error rotating logs', error });
  }
}; 