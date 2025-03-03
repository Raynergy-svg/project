import { encryption } from './middleware';
import { securityConfig } from './config';

export class SensitiveDataHandler {
  private static instance: SensitiveDataHandler;
  private encryptionKey: CryptoKey | null = null;
  private encryptionQueue: Promise<any> = Promise.resolve();
  
  private constructor() {
    // Don't automatically initialize
  }

  public static getInstance(): SensitiveDataHandler {
    if (!SensitiveDataHandler.instance) {
      SensitiveDataHandler.instance = new SensitiveDataHandler();
    }
    return SensitiveDataHandler.instance;
  }

  public async initializeKey(): Promise<void> {
    if (this.encryptionKey) return;
    
    try {
      // Use requestIdleCallback if available, otherwise use a regular promise
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        await new Promise(resolve => 
          (window as any).requestIdleCallback(async () => {
            this.encryptionKey = await securityConfig.encryption.generateKey();
            resolve(void 0);
          })
        );
      } else {
        this.encryptionKey = await securityConfig.encryption.generateKey();
      }
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      throw new Error('Failed to initialize security features');
    }
  }

  private async queueOperation<T>(operation: () => Promise<T>): Promise<T> {
    this.encryptionQueue = this.encryptionQueue.then(async () => {
      try {
        return await operation();
      } catch (error) {
        console.error('Operation failed:', error);
        throw error;
      }
    });
    return this.encryptionQueue;
  }

  public async encryptSensitiveData(data: any): Promise<{
    encryptedData: string;
    iv: string;
  }> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    return this.queueOperation(async () => {
      try {
        const iv = securityConfig.encryption.generateIV();
        const { encryptedData } = await encryption.encrypt(
          JSON.stringify(data),
          this.encryptionKey!,
          iv
        );

        return {
          encryptedData,
          iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
        };
      } catch (error) {
        console.error('Encryption failed:', error);
        throw new Error('Failed to encrypt sensitive data');
      }
    });
  }

  public async decryptSensitiveData(
    encryptedData: string,
    ivHex: string
  ): Promise<any> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    return this.queueOperation(async () => {
      try {
        const iv = new Uint8Array(ivHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
        const decrypted = await encryption.decrypt(
          encryptedData,
          this.encryptionKey!,
          iv
        );

        return JSON.parse(decrypted);
      } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt sensitive data');
      }
    });
  }

  public maskSensitiveData(data: string, type: 'creditCard' | 'ssn' | 'email'): string {
    switch (type) {
      case 'creditCard':
        return data.replace(/^(\d{4})\d{8}(\d{4})$/, '$1********$2');
      case 'ssn':
        return data.replace(/^(\d{3})\d{2}(\d{4})$/, '$1-**-$2');
      case 'email':
        const [username, domain] = data.split('@');
        const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
        return `${maskedUsername}@${domain}`;
      default:
        return data;
    }
  }

  public validateSensitiveData(data: string, type: 'creditCard' | 'ssn' | 'email' | 'password' | 'name' | 'phone' | 'general'): boolean {
    if (!data) return false;
    
    const patterns = {
      creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$/,
      ssn: /^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/,
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      name: /^[A-Za-z\s\-']+$/,
      phone: /^[0-9+\-() ]{8,}$/,
      general: /^[\w\s.,?!@#$%^&*()-=_+[\]{}|;:'",.<>\\/]+$/
    };
    
    // For types that have specific patterns
    if (patterns[type]) {
      return patterns[type].test(data);
    }
    
    // Default case for 'general' and any other types
    switch (type) {
      case 'password':
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special char
        return data.length >= 8;
      case 'name':
        // Allow letters, spaces, hyphens, apostrophes and at least 2 chars
        return patterns.name.test(data) && data.length >= 2;
      case 'phone':
        // Allow digits, +, -, (, ), spaces and at least 8 chars
        return patterns.phone.test(data);
      case 'general':
        // For general text, ensure it's not empty and doesn't contain potentially dangerous characters
        return data.length > 0 && !/[<>{}]/.test(data);
      default:
        return true;
    }
  }

  public sanitizeSensitiveData(data: string): string {
    return data
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[;'"\\]/g, '') // Remove potential SQL injection characters
      .trim(); // Remove leading/trailing whitespace
  }
} 