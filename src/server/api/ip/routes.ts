import { Router } from 'express';
import { IpController } from './ip.controller';

const router = Router();

// Get client IP endpoint
router.get('/client', IpController.getClientIp);

export default router; 