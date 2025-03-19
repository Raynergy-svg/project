/**
 * Centralized patch imports
 * 
 * This file serves as a single entry point for all patches
 * to make it easier to import them in various parts of the application.
 */

// Import and re-export all patches
export * from './rsc-patches';

// For CommonJS compatibility
import './rsc-patches';
