/**
 * Mock implementation of SensitiveDataHandler that provides the same interface 
 * but with simplified functionality that doesn't depend on the security context.
 */
export class MockSensitiveDataHandler {
  private static instance: MockSensitiveDataHandler;

  private constructor() {}

  public static getInstance(): MockSensitiveDataHandler {
    if (!MockSensitiveDataHandler.instance) {
      MockSensitiveDataHandler.instance = new MockSensitiveDataHandler();
    }
    return MockSensitiveDataHandler.instance;
  }

  public async initializeKey(): Promise<void> {
    // No-op, we don't use encryption in the mock
    return Promise.resolve();
  }

  public async encryptSensitiveData(data: any): Promise<{
    encryptedData: string;
    iv: string;
  }> {
    // Simple storage in base64 format
    return {
      encryptedData: btoa(JSON.stringify(data)),
      iv: 'mock-iv'
    };
  }

  public async decryptSensitiveData(
    encryptedData: string,
    ivHex: string
  ): Promise<any> {
    try {
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      console.error('Mock decryption failed:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
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

  public validateSensitiveData(data: string, type: 'creditCard' | 'ssn' | 'email'): boolean {
    const patterns = {
      creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$/,
      ssn: /^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}$/,
      email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    };

    return patterns[type].test(data);
  }

  public sanitizeSensitiveData(data: string): string {
    return data
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[;'"\\]/g, '') // Remove potential SQL injection characters
      .trim(); // Remove leading/trailing whitespace
  }
} 