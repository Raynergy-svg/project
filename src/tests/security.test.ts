import { SensitiveDataHandler } from "@/lib/security/sensitiveData";

describe('SensitiveDataHandler Encryption/Decryption', () => {
  let handler: SensitiveDataHandler;

  beforeAll(async () => {
    handler = SensitiveDataHandler.getInstance();
    await handler.initializeKey();
  });

  it('should encrypt and then decrypt data correctly', async () => {
    const testData = { message: "Hello, world!" };
    const encryptionResult = await handler.encryptSensitiveData(testData);
    expect(encryptionResult.encryptedData).toBeTruthy();
    expect(encryptionResult.iv).toBeTruthy();

    const decryptedData = await handler.decryptSensitiveData(encryptionResult.encryptedData, encryptionResult.iv);
    expect(decryptedData).toEqual(testData);
  });
});

describe('SensitiveDataHandler Sanitization', () => {
  it('should sanitize the input string by removing dangerous characters', () => {
    const dangerousInput = "<script>alert('xss');</script>; DROP TABLE users;";
    const sanitized = SensitiveDataHandler.getInstance().sanitizeSensitiveData(dangerousInput);
    expect(sanitized).not.toMatch(/<script>/i);
    expect(sanitized).not.toMatch(/DROP TABLE/i);
  });
}); 