/**
 * Type definitions for deprecated storage APIs
 */

interface StorageType {
  persistent: string;
}

interface Window {
  StorageType?: StorageType;
} 