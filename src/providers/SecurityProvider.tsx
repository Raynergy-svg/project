"use client";

import React from 'react';

/**
 * This is a compatibility SecurityProvider to fix build errors.
 * @deprecated Use SecurityProvider from @/contexts/SecurityContext instead
 */

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  // Just pass children through, actual security is handled elsewhere now
  return <>{children}</>;
};

export default SecurityProvider;
