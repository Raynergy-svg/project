/**
 * CORS headers for Supabase Edge Functions
 * 
 * This file provides standard CORS headers used across multiple Edge Functions.
 * Centralized to ensure consistency and simplify updates.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',
}; 