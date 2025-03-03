/**
 * Encryption utilities for securing sensitive data
 * Based on Web Crypto API for industry-standard AES-GCM encryption
 */

// Encryption key handling
const getEncryptionKey = async (): Promise<CryptoKey> => {
  // In a production app, this key should be securely retrieved from a server
  // or securely stored in an HSM or managed key service
  // For now, we'll use a derived key from environment variable
  
  const keyMaterial = import.meta.env.VITE_ENCRYPTION_KEY || 'secure_encryption_key_for_field_level_encryption';
  
  // Convert the key material to a format usable by Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyMaterial);
  
  // Use SHA-256 to create a suitable key from the passphrase
  const baseKey = await window.crypto.subtle.digest('SHA-256', keyData);
  
  // Import the raw key material into a CryptoKey
  return window.crypto.subtle.importKey(
    'raw',
    baseKey,
    { name: 'AES-GCM' },
    false,  // Not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive data
 * @param plaintext - The data to encrypt
 * @returns An object with the encrypted data and IV for decryption
 */
export const encryptData = async (plaintext: string): Promise<{ 
  encrypted: string; 
  iv: string;
}> => {
  try {
    const key = await getEncryptionKey();
    
    // Generate a random IV (Initialization Vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encode the plaintext
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    // Encrypt the data
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Convert the encrypted data and IV to base64 strings for storage
    const encryptedArray = Array.from(new Uint8Array(encryptedBuffer));
    const ivArray = Array.from(iv);
    
    return {
      encrypted: btoa(String.fromCharCode.apply(null, encryptedArray)),
      iv: btoa(String.fromCharCode.apply(null, ivArray))
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt encrypted data
 * @param encrypted - The encrypted data as a base64 string
 * @param iv - The initialization vector as a base64 string
 * @returns The decrypted plaintext
 */
export const decryptData = async (
  encrypted: string,
  iv: string
): Promise<string> => {
  try {
    const key = await getEncryptionKey();
    
    // Convert base64 strings back to Uint8Array
    const encryptedBytes = Uint8Array.from(
      atob(encrypted),
      c => c.charCodeAt(0)
    );
    
    const ivBytes = Uint8Array.from(
      atob(iv),
      c => c.charCodeAt(0)
    );
    
    // Decrypt the data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes
      },
      key,
      encryptedBytes
    );
    
    // Decode the plaintext
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Utility function to encrypt a field for storage in database
 * @param value - The value to encrypt
 * @returns Object with encrypted value and iv for storage
 */
export const encryptField = async (value: string): Promise<{
  encryptedValue: string;
  iv: string;
}> => {
  if (!value) return { encryptedValue: '', iv: '' };
  
  const { encrypted, iv } = await encryptData(value);
  return {
    encryptedValue: encrypted,
    iv
  };
};

/**
 * Utility function to decrypt a field retrieved from database
 * @param encryptedValue - The encrypted value
 * @param iv - The initialization vector
 * @returns Decrypted value
 */
export const decryptField = async (
  encryptedValue: string,
  iv: string
): Promise<string> => {
  if (!encryptedValue || !iv) return '';
  
  return await decryptData(encryptedValue, iv);
}; 