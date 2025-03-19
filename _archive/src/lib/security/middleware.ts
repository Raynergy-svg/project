import { securityConfig } from './config';
import type { Request, Response, NextFunction } from 'express';

// Encryption utility using Web Crypto API
export const encryption = {
  encrypt: async (text: string, key: CryptoKey, iv: Uint8Array): Promise<{ encryptedData: string; tag?: Uint8Array }> => {
    try {
      const encodedText = new TextEncoder().encode(text);
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encodedText
      );

      // Convert ArrayBuffer to Base64 string
      const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
      const encryptedBase64 = btoa(String.fromCharCode.apply(null, encryptedArray));
      
      return {
        encryptedData: encryptedBase64
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  },

  decrypt: async (encryptedData: string, key: CryptoKey, iv: Uint8Array): Promise<string> => {
    try {
      // Convert Base64 string back to ArrayBuffer
      const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encryptedBytes
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Apply server-side security headers
  Object.entries(securityConfig.headers.serverSide).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  // Apply client-side security headers that must also be set server-side
  Object.entries(securityConfig.headers.clientSide).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  next();
};

// Rate limiting middleware
export const rateLimit = (() => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, {
        count: 1,
        resetTime: now + securityConfig.rateLimit.windowMs
      });
      return next();
    }

    const request = requests.get(ip)!;
    
    if (now > request.resetTime) {
      request.count = 1;
      request.resetTime = now + securityConfig.rateLimit.windowMs;
      return next();
    }

    if (request.count >= securityConfig.rateLimit.max) {
      return res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    }

    request.count++;
    next();
  };
})();

// SSL enforcement middleware
export const enforceSSL = (req: Request, res: Response, next: NextFunction) => {
  if (securityConfig.ssl.enabled && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};

// Data sanitization middleware
export const sanitizeData = (req: Request, res: Response, next: NextFunction) => {
  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    return Object.entries(obj).reduce((acc, [key, value]) => {
      // Remove potential XSS
      if (typeof value === 'string') {
        value = value
          .replace(/[<>]/g, '')  // Remove < and >
          .replace(/javascript:/gi, '')  // Remove javascript: protocol
          .replace(/on\w+=/gi, '');  // Remove inline event handlers
      }
      
      acc[key] = typeof value === 'object' ? sanitize(value) : value;
      return acc;
    }, {} as any);
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

// Combine all security middleware
export const securityMiddleware = [
  enforceSSL,
  securityHeaders,
  rateLimit,
  sanitizeData
]; 