/**
 * Encoding utilities that use the platform's native methods instead of deprecated packages
 * This file provides modern alternatives to deprecated packages like abab and domexception
 */

/**
 * Converts a base64 string to a binary array
 * Uses the platform's native atob() method instead of abab package
 */
export function base64ToBinary(base64: string): Uint8Array {
  // Use the native atob method
  const binaryString = globalThis.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  
  // Convert binary string to array buffer
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}

/**
 * Converts a binary array to base64
 * Uses the platform's native btoa() method instead of abab package
 */
export function binaryToBase64(bytes: Uint8Array): string {
  // Convert array buffer to binary string
  let binaryString = '';
  const length = bytes.length;
  
  for (let i = 0; i < length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  
  // Use the native btoa method
  return globalThis.btoa(binaryString);
}

/**
 * Creates a DOMException
 * Uses the platform's native DOMException instead of domexception package
 */
export function createDOMException(message: string, name: string): DOMException {
  // Use the native DOMException
  return new DOMException(message, name);
}

/**
 * Safe wrapper for atob that handles URL-safe base64 strings
 */
export function safeAtob(base64: string): string {
  // Replace URL-safe characters
  const normalizedBase64 = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Add padding if needed
  const paddedBase64 = normalizedBase64.padEnd(
    normalizedBase64.length + (4 - (normalizedBase64.length % 4)) % 4,
    '='
  );
  
  try {
    return globalThis.atob(paddedBase64);
  } catch (error) {
    throw createDOMException(
      'Failed to decode base64 string',
      'InvalidCharacterError'
    );
  }
}

/**
 * Safe wrapper for btoa that handles non-ASCII characters
 */
export function safeBtoa(input: string): string {
  try {
    // Handle non-ASCII characters by using encodeURIComponent
    const encodedInput = encodeURIComponent(input)
      .replace(/%([0-9A-F]{2})/g, (_, p1) => 
        String.fromCharCode(parseInt(p1, 16))
      );
    
    return globalThis.btoa(encodedInput);
  } catch (error) {
    throw createDOMException(
      'Failed to encode string to base64', 
      'InvalidCharacterError'
    );
  }
} 