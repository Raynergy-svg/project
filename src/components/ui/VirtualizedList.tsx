import { useRef, useState, useEffect, memo, ReactNode, ComponentType, UIEvent } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number | string;
  width: number | string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
}

/**
 * A simple virtualized list component that only renders items that are visible 
 * within the viewport, plus a configurable overscan amount.
 */
export function VirtualizedList<T>({ 
  items, 
  itemHeight, 
  height, 
  width,
  renderItem, 
  className = '',
  overscan = 5,
  onScroll
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Handle scroll events
  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
    if (onScroll) {
      onScroll(event);
    }
  };
  
  // Calculate which items should be visible
  const visibleStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleEndIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + (containerRef.current?.clientHeight || 0)) / itemHeight) + overscan
  );

  // Create array of only the visible items
  const visibleItems = items.slice(visibleStartIndex, visibleEndIndex + 1);
  
  // Calculate the total height of the scroll area
  const totalHeight = items.length * itemHeight;
  
  // Position the visible items correctly
  const translateY = visibleStartIndex * itemHeight;
  
  return (
    <div 
      ref={containerRef}
      style={{ height, width, overflow: 'auto', position: 'relative' }}
      className={className}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            transform: `translateY(${translateY}px)` 
          }}
        >
          {visibleItems.map((item, localIndex) => {
            const index = visibleStartIndex + localIndex;
            return (
              <div key={index} style={{ height: itemHeight }}>
                {renderItem(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Memoized version for better performance
export const MemoizedVirtualizedList = memo(VirtualizedList) as typeof VirtualizedList; 