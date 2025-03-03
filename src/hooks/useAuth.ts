// Re-export the useAuth hook from AuthContext to ensure consistency
// This allows components to import from either @/hooks/useAuth or @/contexts/AuthContext
export { useAuth } from '@/contexts/AuthContext';
