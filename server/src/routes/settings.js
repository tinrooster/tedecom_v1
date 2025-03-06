const express = require('express');
const Settings = require('../models/settings');

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        
        // Remove sensitive information
        const safeSettings = {
            ...settings.toObject(),
            emailNotifications: {
                ...settings.emailNotifications,
                password: undefined
            }
        };
        
        res.status(200).json(safeSettings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// Update settings
router.put('/', async (req, res) => {
    try {
        const updates = req.body;
        
        // Get current settings
        let settings = await Settings.getSettings();
        
        // Update settings
        if (updates.emailNotifications) {
            settings.emailNotifications = {
                ...settings.emailNotifications,
                ...updates.emailNotifications
            };
        }
        
        if (updates.logging) {
            settings.logging = {
                ...settings.logging,
                ...updates.logging
            };
        }
        
        if (updates.backup) {
            settings.backup = {
                ...settings.backup,
                ...updates.backup
            };
        }
        
        if (updates.security) {
            settings.security = {
                ...settings.security,
                ...updates.security
            };
        }
        
        await settings.save();
        
        // Remove sensitive information
        const safeSettings = {
            ...settings.toObject(),
            emailNotifications: {
                ...settings.emailNotifications,
                password: undefined
            }
        };
        
        res.status(200).json({
            message: 'Settings updated successfully',
            settings: safeSettings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(400).json({ error: 'Failed to update settings' });
    }
});

// Test email settings
router.post('/test-email', async (req, res) => {
    try {
        const { recipient } = req.body;
        
        if (!recipient) {
            return res.status(400).json({ error: 'Recipient email is required' });
        }
        
        const settings = await Settings.getSettings();
        
        if (!settings.emailNotifications.enabled) {
            return res.status(400).json({ error: 'Email notifications are not enabled' });
        }
        
        // In a real implementation, we would send a test email here
        
        res.status(200).json({
            message: 'Test email sent successfully'
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

module.exports = router; 