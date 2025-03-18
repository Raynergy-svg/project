"use client";

import React from 'react';

/**
 * This is a placeholder NextAuthProvider to maintain compatibility with existing imports.
 * The actual authentication has been migrated to a different provider.
 * @deprecated Use AuthProvider from @/contexts/AuthContext instead
 */

interface NextAuthProviderProps {
  children: React.ReactNode;
}

export const NextAuthProvider: React.FC<NextAuthProviderProps> = ({ children }) => {
  // Just render children, actual auth is handled elsewhere now
  return <>{children}</>;
};

export default NextAuthProvider;
