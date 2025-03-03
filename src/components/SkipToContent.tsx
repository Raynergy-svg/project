import React, { useState } from 'react';
import { accessibilityProps } from '../utils/accessibility';

interface SkipToContentProps {
  contentId?: string;
  className?: string;
}

/**
 * A skip-to-content link that appears when tabbed to, allowing keyboard users
 * to skip navigation and go straight to main content.
 * 
 * This is a crucial accessibility feature for keyboard users.
 */
const SkipToContent: React.FC<SkipToContentProps> = ({
  contentId = 'main-content',
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const contentElement = document.getElementById(contentId);
    
    if (contentElement) {
      // Set tabindex temporarily to ensure it's focusable
      contentElement.setAttribute('tabindex', '-1');
      contentElement.focus();
      
      // Remove tabindex after focusing
      setTimeout(() => {
        contentElement.removeAttribute('tabindex');
      }, 100);
    }
  };
  
  return (
    <a
      href={`#${contentId}`}
      className={`
        fixed top-0 left-0 z-50 transform -translate-y-full p-2 bg-primary text-white
        focus:translate-y-0 transition-transform duration-200
        rounded-b-md shadow-md font-medium
        ${isFocused ? 'translate-y-0' : ''}
        ${className}
      `}
      onClick={handleClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...accessibilityProps({
        description: 'Skip to main content'
      })}
    >
      Skip to main content
    </a>
  );
};

export default SkipToContent; 