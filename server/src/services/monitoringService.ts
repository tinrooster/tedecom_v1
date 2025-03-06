import mongoose from 'mongoose';
import { Report } from '../models/Report';
import { Equipment } from '../models/Equipment';
import { logger } from '../utils/logger';
import os from 'os';

interface SystemMetrics {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
}

interface DatabaseMetrics {
    connections: number;
    operations: number;
    latency: number;
}

interface SystemStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  components: {
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      latency: number;
      connections: number;
    };
    reports: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      pending: number;
      failed: number;
      completed: number;
    };
    system: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      cpu: {
        usage: number;
        cores: number;
      };
      memory: {
        total: number;
        used: number;
        free: number;
      };
      disk: {
        total: number;
        used: number;
        free: number;
      };
    };
  };
  issues: string[];
}

export class MonitoringService {
    private healthCheckInterval: NodeJS.Timeout;
    private lastStatus: SystemStatus;

    constructor() {
        this.lastStatus = this.getInitialStatus();
        this.healthCheckInterval = setInterval(() => this.performHealthCheck(), 60000);
    }

    private getInitialStatus(): SystemStatus {
        return {
            status: 'healthy',
            timestamp: new Date(),
            components: {
                database: {
                    status: 'healthy',
                    latency: 0,
                    connections: 0
                },
                reports: {
                    status: 'healthy',
                    pending: 0,
                    failed: 0,
                    completed: 0
                },
                system: {
                    status: 'healthy',
                    cpu: {
                        usage: 0,
                        cores: os.cpus().length
                    },
                    memory: {
                        total: os.totalmem(),
                        used: os.totalmem() - os.freemem(),
                        free: os.freemem()
                    },
                    disk: {
                        total: 0,
                        used: 0,
                        free: 0
                    }
                }
            },
            issues: []
        };
    }

    async getSystemStatus(): Promise<{
        status: string;
        metrics: SystemMetrics;
        dbMetrics: DatabaseMetrics;
    }> {
        const metrics = await this.getSystemMetrics();
        const dbMetrics = await this.getDatabaseMetrics();

        return {
            status: 'operational',
            metrics,
            dbMetrics
        };
    }

    private async getSystemMetrics(): Promise<SystemMetrics> {
        // TODO: Implement actual system metrics collection
        return {
            cpu: 0,
            memory: 0,
            disk: 0,
            uptime: process.uptime()
        };
    }

    private async getDatabaseMetrics(): Promise<DatabaseMetrics> {
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }

        // TODO: Implement actual database metrics collection
        return {
            connections: 0,
            operations: 0,
            latency: 0
        };
    }

    private async performHealthCheck(): Promise<void> {
        try {
            await this.checkDatabaseConnection();
            await this.checkReportGeneration();
            await this.checkEquipmentStatus();
        } catch (error) {
            console.error('Health check failed:', error);
        }
    }

    private async checkDatabaseConnection(): Promise<void> {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not ready');
        }
    }

    private async checkReportGeneration(): Promise<void> {
        const recentReports = await Report.find({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        const failedReports = recentReports.filter(report => report.status === 'failed');
        if (failedReports.length > 0) {
            console.warn(`${failedReports.length} reports failed in the last 24 hours`);
        }
    }

    private async checkEquipmentStatus(): Promise<void> {
        const equipment = await Equipment.find({});
        const statusCounts = equipment.reduce((acc: Record<string, number>, e) => {
            acc[e.status] = (acc[e.status] || 0) + 1;
            return acc;
        }, {});

        console.log('Equipment status distribution:', statusCounts);
    }

    cleanup(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
    }
} 