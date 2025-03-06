import express from 'express';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';

const router = express.Router();

// Health check endpoint - no auth required
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// System metrics - requires auth and admin role
router.get('/metrics', auth, roleCheck(['admin']), (req, res) => {
    // TODO: Implement metrics endpoint
    res.status(200).json({ metrics: [] });
});

export default router; 