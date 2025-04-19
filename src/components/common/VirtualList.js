import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * VirtualList component for efficiently rendering large lists
 * Only renders items that are visible in the viewport to improve performance
 * 
 * @param {Object} props Component props
 * @param {Array} props.items Array of items to render
 * @param {Function} props.renderItem Function to render each item
 * @param {number} props.itemHeight Fixed height of each item in pixels
 * @param {number} props.overscan Number of extra items to render above/below viewport
 * @param {number} props.height Height of the list container
 * @param {string} props.className Additional CSS classes
 */
const VirtualList = ({
  items = [],
  renderItem,
  itemHeight = 50,
  overscan = 3,
  height = 400,
  className = '',
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  // Calculate which items should be visible
  const getVisibleRange = useCallback(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + height) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, height, itemHeight, overscan, items.length]);
  
  // Handle scroll events
  const handleScroll = useCallback((e) => {
    requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop);
    });
  }, []);
  
  // Calculate visible items
  const { startIndex, endIndex } = getVisibleRange();
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  // Calculate padding to maintain scroll position
  const topPadding = startIndex * itemHeight;
  const bottomPadding = (items.length - endIndex - 1) * itemHeight;
  
  // Total list height
  const totalHeight = items.length * itemHeight;
  
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      {...props}
    >
      {/* Spacer to maintain correct scroll height */}
      <div style={{ height: totalHeight }}>
        {/* Container for visible items with correct positioning */}
        <div style={{ 
          position: 'absolute', 
          top: topPadding, 
          left: 0, 
          right: 0,
          height: visibleItems.length * itemHeight 
        }}>
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <div 
                key={actualIndex} 
                style={{ height: itemHeight, position: 'absolute', top: index * itemHeight, left: 0, right: 0 }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(VirtualList);