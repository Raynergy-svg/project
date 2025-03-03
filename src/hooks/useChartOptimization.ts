import { useMemo } from 'react';

/**
 * Hook to memoize chart data to prevent unnecessary recalculations
 * @param data Source data for the chart
 * @param dependencies Additional dependencies that should trigger recalculation
 * @returns Memoized chart data
 */
export function useChartData<T>(data: T, dependencies: any[] = []): T {
  return useMemo(() => data, [
    // Using JSON.stringify for deep comparison of data
    // Only in development - in production, use a more efficient method
    JSON.stringify(data),
    ...dependencies
  ]);
}

/**
 * Hook for calculating chart dimensions based on container size
 * @param containerWidth Width of the container
 * @param aspectRatio Desired aspect ratio (width/height)
 * @returns Optimized chart dimensions
 */
export function useChartDimensions(containerWidth: number, aspectRatio: number = 16/9) {
  return useMemo(() => {
    const width = containerWidth || 300; // Fallback to 300px
    const height = width / aspectRatio;
    
    return {
      width,
      height,
      margin: {
        top: Math.round(height * 0.05),
        right: Math.round(width * 0.05),
        bottom: Math.round(height * 0.1),
        left: Math.round(width * 0.08)
      }
    };
  }, [containerWidth, aspectRatio]);
}

/**
 * Generate consistent colors for chart elements
 * @param count Number of colors needed
 * @param baseColor Base color to derive from
 * @returns Array of color codes
 */
export function useChartColorScheme(count: number, baseColor: string = '#88B04B') {
  return useMemo(() => {
    // For simplicity, we'll use a predefined array
    // In a real app, you'd generate these programmatically
    const colorScheme = [
      '#88B04B', // Main brand color
      '#A4C88B',
      '#C5E1BD',
      '#D6EAD6',
      '#E8F4EF',
      '#76A5AF',
      '#5B8896',
      '#4A7A8C',
    ];
    
    // If we need more colors than available, reuse with different opacity
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colorScheme[i % colorScheme.length]);
    }
    
    return result;
  }, [count, baseColor]);
} 