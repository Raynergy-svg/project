'use client';

// This file is a re-export of AuthContext.tsx to maintain backward compatibility
// Use AuthContext.tsx directly for new code

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/contexts/AuthContext';

export { AuthProvider, useAuth };
export type { UserProfile };
export default AuthProvider; 