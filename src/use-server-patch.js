/**
 * Compatibility patch for use-server functionality
 * This is a placeholder to ensure backward compatibility
 */

// Export dummy functions
export const serverAction = (fn) => {
  console.warn('Server actions are not available in this context');
  return fn;
};

export const useServerAction = () => {
  console.warn('Server actions are not available in this context');
  return null;
};

// Default export
export default {
  serverAction,
  useServerAction
};
