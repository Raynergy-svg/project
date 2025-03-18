"use client";

import React from 'react';

/**
 * This is a compatibility DeviceProvider to fix build errors.
 * @deprecated Use DeviceProvider from @/contexts/DeviceContext instead
 */

interface DeviceProviderProps {
  children: React.ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  // Just pass children through, actual device detection is handled elsewhere now
  return <>{children}</>;
};

export default DeviceProvider;
