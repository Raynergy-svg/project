import { Request, Response } from 'express';
import fetch from 'node-fetch';

/**
 * Controller for IP-related endpoints
 */
export class IpController {
  /**
   * Get the client's IP address
   * This endpoint acts as a proxy to avoid CSP issues when fetching IP from external services
   */
  static async getClientIp(req: Request, res: Response): Promise<void> {
    try {
      // First try to get IP from request headers
      const clientIp = 
        req.headers['x-forwarded-for'] || 
        req.headers['x-real-ip'] || 
        req.socket.remoteAddress || 
        '0.0.0.0';
      
      // If we have a valid IP from headers, return it
      if (clientIp && clientIp !== '0.0.0.0' && clientIp !== '::1') {
        res.json({ ip: Array.isArray(clientIp) ? clientIp[0] : clientIp });
        return;
      }
      
      // If we couldn't get IP from headers, try external service
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        res.json({ ip: data.ip });
      } catch (externalError) {
        console.error('Error fetching IP from external service:', externalError);
        res.json({ ip: '0.0.0.0', source: 'fallback' });
      }
    } catch (error) {
      console.error('Error in getClientIp:', error);
      res.status(500).json({ 
        error: 'Failed to determine client IP',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 