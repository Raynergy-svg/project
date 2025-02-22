import { createContext, useContext, useEffect } from 'react';
import { useDevice } from '@/hooks/useDevice';
import type { DeviceInfo, DeviceProviderProps } from '@/types/device';

const DeviceContext = createContext<DeviceInfo | null>(null);

/**
 * DeviceProvider component that provides device information to the application.
 * This includes device type, orientation, touch capabilities, and motion preferences.
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <DeviceProvider>
 *       <YourApp />
 *     </DeviceProvider>
 *   );
 * }
 * ```
 */
export function DeviceProvider({ children }: DeviceProviderProps) {
  const deviceInfo = useDevice();

  // Log device info in development for testing
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Device Info:', {
        ...deviceInfo,
        timestamp: new Date().toISOString()
      });
    }
  }, [deviceInfo]);

  return (
    <DeviceContext.Provider value={deviceInfo}>
      {/* Add data attributes for testing */}
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

/**
 * Hook to access device information from any component within DeviceProvider.
 * 
 * @throws {Error} If used outside of DeviceProvider
 * @returns {DeviceInfo} Current device information
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop } = useDeviceContext();
 *   
 *   return (
 *     <div>
 *       {isMobile && <MobileLayout />}
 *       {isTablet && <TabletLayout />}
 *       {isDesktop && <DesktopLayout />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDeviceContext(): DeviceInfo {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
}