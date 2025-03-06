import express from 'express';
import {
  getSettings,
  updateSettings,
  testEmailSettings,
  performBackup,
  rotateLogs,
} from '../controllers/settingsController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';

const router = express.Router();

// All settings routes require authentication and admin role
router.use(auth);
router.use(roleCheck(['admin']));

// Get all settings
router.get('/', async (req, res) => {
    try {
        // TODO: Implement get settings
        res.status(200).json({ settings: {} });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve settings' });
    }
});

// Update settings
router.put('/', async (req, res) => {
    try {
        // TODO: Implement update settings
        res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Test email settings
router.post('/test-email', testEmailSettings);

// Perform manual backup
router.post('/backup', performBackup);

// Rotate logs
router.post('/rotate-logs', rotateLogs);

export default router; 