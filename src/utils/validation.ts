/**
 * Validates password strength according to OWASP guidelines
 * - At least 10 characters
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one digit
 * - Contains at least one special character
 * 
 * @param password - The password to validate
 * @returns Object with isValid flag and any error messages
 */
export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (!password || password.length < 10) {
    errors.push('Password must be at least 10 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check if password contains common patterns or dictionary words
  const commonPatterns = [
    'password', '123456', 'qwerty', 'admin', 'welcome',
    // Add more common patterns
  ];
  
  const lowerPassword = password.toLowerCase();
  if (commonPatterns.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('Password contains common patterns that are easily guessable');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}; 