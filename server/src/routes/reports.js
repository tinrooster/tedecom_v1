const express = require('express');
const Report = require('../models/report');

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
        
        // In a real implementation, we would trigger the report generation process here
        // For now, we'll just return the created report
        
        res.status(201).json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(400).json({ error: 'Failed to create report' });
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
        
        res.status(200).json({
            message: 'Report deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ error: 'Failed to delete report' });
    }
});

module.exports = router; 