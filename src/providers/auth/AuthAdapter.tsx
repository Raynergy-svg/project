"use client";

import React from 'react';

/**
 * This is a compatibility AuthAdapter to fix build errors.
 * @deprecated Use AuthProvider from @/contexts/AuthContext instead
 */

interface AuthAdapterProps {
  children: React.ReactNode;
}

export const AuthAdapter: React.FC<AuthAdapterProps> = ({ children }) => {
  // Just pass children through, actual auth is handled elsewhere now
  return <>{children}</>;
};

export default AuthAdapter;
