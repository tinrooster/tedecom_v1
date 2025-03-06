import { Request, Response } from 'express';
import { MonitoringService } from '../services/monitoringService';
import { logger } from '../utils/logger';

const monitoringService = new MonitoringService();

export const getHealthCheck = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
};

export const getSystemStatus = async (req: Request, res: Response) => {
    try {
        const status = await monitoringService.getSystemStatus();
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get system status' });
    }
};

export async function getReportMetrics(req: Request, res: Response): Promise<void> {
  try {
    const metrics = await monitoringService.getReportMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error getting report metrics:', error);
    res.status(500).json({ error: 'Failed to get report metrics' });
  }
}

export async function getResourceUsage(req: Request, res: Response): Promise<void> {
  try {
    const usage = await monitoringService.getResourceUsage();
    res.json(usage);
  } catch (error) {
    logger.error('Error getting resource usage:', error);
    res.status(500).json({ error: 'Failed to get resource usage' });
  }
} 