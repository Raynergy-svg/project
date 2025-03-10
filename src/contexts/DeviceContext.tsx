'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { DeviceInfo } from '@/types/device';

// Default values for SSR
const defaultDeviceInfo: DeviceInfo = {
  type: 'desktop',
  orientation: 'landscape',
  isTouchDevice: false,
  isReducedMotion: false,
  devicePixelRatio: 1,
  hasMouse: true,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isMobileOrTablet: false,
  isPortrait: false,
  isLandscape: true
};

const DeviceContext = createContext<DeviceInfo>(defaultDeviceInfo);

export const useDeviceContext = () => useContext(DeviceContext);

interface DeviceProviderProps {
  children: React.ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(defaultDeviceInfo);

  useEffect(() => {
    const getDeviceType = (width: number): DeviceInfo['type'] => {
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    };

    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const type = getDeviceType(width);
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasMouse = window.matchMedia('(pointer: fine)').matches;

      setDeviceInfo({
        type,
        orientation,
        isTouchDevice,
        isReducedMotion,
        devicePixelRatio: window.devicePixelRatio,
        hasMouse,
        isMobile: type === 'mobile',
        isTablet: type === 'tablet',
        isDesktop: type === 'desktop',
        isMobileOrTablet: type === 'mobile' || type === 'tablet',
        isPortrait: orientation === 'portrait',
        isLandscape: orientation === 'landscape'
      });
    };

    // Initial update
    updateDeviceInfo();

    // Add event listeners
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateDeviceInfo, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: fine)');

    reducedMotionQuery.addEventListener('change', updateDeviceInfo);
    pointerQuery.addEventListener('change', updateDeviceInfo);

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Initial Device Info:', deviceInfo);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      reducedMotionQuery.removeEventListener('change', updateDeviceInfo);
      pointerQuery.removeEventListener('change', updateDeviceInfo);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <DeviceContext.Provider value={deviceInfo}>
      <div 
        data-device-type={deviceInfo.type}
        data-orientation={deviceInfo.orientation}
        data-touch={deviceInfo.isTouchDevice}
        data-reduced-motion={deviceInfo.isReducedMotion}
      >
        {children}
      </div>
    </DeviceContext.Provider>
  );
} 