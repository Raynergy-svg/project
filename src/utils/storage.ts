/**
 * Storage utility for handling browser storage in a modern way.
 * This includes a polyfill for the deprecated StorageType.persistent API.
 */

// Modern storage permission request
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator || !navigator.storage || typeof navigator.storage.persist !== 'function') {
    console.warn('Persistent storage is not supported in this browser');
    return false;
  }

  try {
    // Request permission to use persistent storage
    const isPersisted = await navigator.storage.persist();
    return isPersisted;
  } catch (error) {
    console.error('Error requesting persistent storage:', error);
    return false;
  }
}

// Check if storage is persisted already
export async function isPersistentStorage(): Promise<boolean> {
  if (!navigator || !navigator.storage || typeof navigator.storage.persisted !== 'function') {
    return false;
  }
  
  try {
    return await navigator.storage.persisted();
  } catch (error) {
    console.error('Error checking persistent storage status:', error);
    return false;
  }
}

// Get storage usage and quota information
export async function getStorageEstimate(): Promise<{ usage: number; quota: number }> {
  if (!navigator || !navigator.storage || typeof navigator.storage.estimate !== 'function') {
    return { usage: 0, quota: 0 };
  }
  
  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0
    };
  } catch (error) {
    console.error('Error getting storage estimate:', error);
    return { usage: 0, quota: 0 };
  }
}

// Safe localStorage wrapper
export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },
  
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },
  
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Polyfill for deprecated StorageType.persistent
// This is for backward compatibility with older code
if (typeof window !== 'undefined') {
  // @ts-ignore - Define StorageType if it doesn't exist
  if (!window.StorageType) {
    // @ts-ignore
    window.StorageType = {
      get persistent() {
        console.warn('StorageType.persistent is deprecated. Please use standardized navigator.storage instead.');
        // Attempt to use the modern API
        requestPersistentStorage().catch(console.error);
        return 'persistent';
      }
    };
  }
}

export default {
  requestPersistentStorage,
  isPersistentStorage,
  getStorageEstimate,
  safeLocalStorage
}; 