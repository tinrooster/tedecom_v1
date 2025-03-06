const express = require('express');
const Report = require('../models/report');
const reportGenerationService = require('../services/reportGenerationService');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Get all reports
router.get('/', async (req, res) => {
    try {
        const reports = await Report.find()
            .sort({ createdAt: -1 })
            .populate('createdBy', 'username');
        
        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Get report by ID
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('createdBy', 'username');
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.status(200).json(report);
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

// Create new report
router.post('/', async (req, res) => {
    try {
        const { title, type, format, parameters } = req.body;
        
        // This will be set by auth middleware
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const report = new Report({
            title,
            type,
            format,
            parameters,
            createdBy: userId,
            status: 'pending'
        });
        
        await report.save();
        
        // Trigger the report generation process
        reportGenerationService.generateReport(report._id)
            .catch(error => console.error('Error generating report:', error));
        
        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(400).json({ error: 'Failed to create report' });
    }
});

// Download report file
router.get('/:id/download', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        if (report.status !== 'completed') {
            return res.status(400).json({ error: 'Report is not ready for download' });
        }
        
        if (!report.filePath || !fs.existsSync(report.filePath)) {
            return res.status(404).json({ error: 'Report file not found' });
        }
        
        const filename = path.basename(report.filePath);
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', getContentType(report.format));
        
        const fileStream = fs.createReadStream(report.filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading report:', error);
        res.status(500).json({ error: 'Failed to download report' });
    }
});

// Get report status
router.get('/:id/status', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.status(200).json({ status: report.status });
    } catch (error) {
        console.error('Error fetching report status:', error);
        res.status(500).json({ error: 'Failed to fetch report status' });
    }
});

// Get report types
router.get('/types', async (req, res) => {
    try {
        const reportTypes = [
            { type: 'equipment_status', description: 'Equipment Status Report' },
            { type: 'decommission_progress', description: 'Decommission Progress Report' },
            { type: 'rack_utilization', description: 'Rack Utilization Report' },
            { type: 'power_consumption', description: 'Power Consumption Report' },
            { type: 'inventory_valuation', description: 'Inventory Valuation Report' },
            { type: 'maintenance_schedule', description: 'Maintenance Schedule Report' },
            { type: 'risk_assessment', description: 'Risk Assessment Report' },
            { type: 'cost_analysis', description: 'Cost Analysis Report' },
            { type: 'compliance_report', description: 'Compliance Report' }
        ];
        
        res.status(200).json(reportTypes);
    } catch (error) {
        console.error('Error fetching report types:', error);
        res.status(500).json({ error: 'Failed to fetch report types' });
    }
});

// Schedule a report
router.post('/:id/schedule', async (req, res) => {
    try {
        const { frequency, dayOfWeek, dayOfMonth, time, recipients } = req.body;
        
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        report.schedule = {
            frequency,
            dayOfWeek,
            dayOfMonth,
            time,
            recipients
        };
        
        await report.save();
        
        // In a real implementation, we would set up the schedule here
        
        res.status(200).json({
            message: 'Report scheduled successfully',
            report
        });
    } catch (error) {
        console.error('Error scheduling report:', error);
        res.status(400).json({ error: 'Failed to schedule report' });
    }
});

// Cancel a scheduled report
router.delete('/:id/schedule', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        report.schedule = undefined;
        await report.save();
        
        // In a real implementation, we would cancel the schedule here
        
        res.status(200).json({
            message: 'Report schedule cancelled',
            report
        });
    } catch (error) {
        console.error('Error cancelling report schedule:', error);
        res.status(500).json({ error: 'Failed to cancel report schedule' });
    }
});

// Delete a report
router.delete('/:id', async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);
        
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        // Delete the report file if it exists
        if (report.filePath && fs.existsSync(report.filePath)) {
            fs.unlinkSync(report.filePath);
        }
        
        res.status(200).json({
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

// Helper function to get content type based on format
function getContentType(format) {
    switch (format) {
        case 'pdf':
            return 'application/pdf';
        case 'excel':
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'csv':
            return 'text/csv';
        default:
            return 'application/octet-stream';
    }
}

module.exports = router; 