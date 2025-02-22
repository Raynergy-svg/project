import { securityConfig } from './config';
import { securityMiddleware } from './middleware';
import { SensitiveDataHandler } from './sensitiveData';

// Export all security features
export { securityConfig } from './config';
export { securityMiddleware, encryption } from './middleware';
export { SensitiveDataHandler } from './sensitiveData';

// Export a function to initialize all security features
export const initializeSecurity = () => {
  const sensitiveDataHandler = SensitiveDataHandler.getInstance();
  return {
    securityConfig,
    securityMiddleware,
    sensitiveDataHandler
  };
}; 