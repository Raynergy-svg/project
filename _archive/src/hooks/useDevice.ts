import { useState, useEffect, useCallback } from 'react';
import { useBreakpoint } from './useBreakpoint';
import type { DeviceInfo } from '@/types/device';

// Move getDeviceType definition to the top
const getDeviceType = (width: number): DeviceInfo['type'] => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

const getInitialDeviceInfo = (): DeviceInfo => {
  if (typeof window === 'undefined') {
    return {
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
  }

  const type = getDeviceType(window.innerWidth);
  const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasMouse = window.matchMedia('(pointer: fine)').matches;
  
  return {
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
  };
};

export function useDevice(): DeviceInfo {
  const { width } = useBreakpoint();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getInitialDeviceInfo());

  const updateDeviceInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    const type = getDeviceType(window.innerWidth);
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
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: number;

    const handleUpdate = () => {
      // Debounce updates
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateDeviceInfo, 150); // 150ms debounce
    };

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleUpdate, { passive: true });
    
    // Listen for reduced motion preference changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', handleUpdate);

    // Listen for pointer device changes
    const pointerQuery = window.matchMedia('(pointer: fine)');
    pointerQuery.addEventListener('change', handleUpdate);

    // Initial check
    updateDeviceInfo();

    return () => {
      window.removeEventListener('orientationchange', handleUpdate);
      reducedMotionQuery.removeEventListener('change', handleUpdate);
      pointerQuery.removeEventListener('change', handleUpdate);
      clearTimeout(timeoutId);
    };
  }, [updateDeviceInfo]);

  // Update when breakpoint width changes
  useEffect(() => {
    updateDeviceInfo();
  }, [width, updateDeviceInfo]);

  return deviceInfo;
}