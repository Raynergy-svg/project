export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  isReducedMotion: boolean;
  devicePixelRatio: number;
  hasMouse: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobileOrTablet: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

export interface DeviceProviderProps {
  children: React.ReactNode;
}