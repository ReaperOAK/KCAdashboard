import React, { useState, useEffect, useRef } from 'react';

/**
 * Optimized search input with debouncing and performance optimizations
 * 
 * @param {Object} props Component props
 * @param {function} props.onSearch Function to call when search is triggered
 * @param {number} props.debounceTime Delay in ms before triggering search (default: 300ms)
 * @param {string} props.placeholder Placeholder text for the input
 * @param {string} props.className Additional CSS classes
 * @param {boolean} props.autoFocus Whether to autofocus the input
 * @param {string} props.initialValue Initial search value
 */
const OptimizedSearchInput = ({
  onSearch,
  debounceTime = 300,
  placeholder = 'Search...',
  className = '',
  autoFocus = false,
  initialValue = '',
  ...props
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Handle input changes with debouncing
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceTime);
  };
  
  // Clear the debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Clear search on Escape
    if (e.key === 'Escape') {
      setSearchTerm('');
      onSearch('');
      inputRef.current?.blur();
    }
    
    // Immediately trigger search on Enter
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      onSearch(searchTerm);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg 
            className="w-4 h-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="search"
          className={`block w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 outline-none transition-all ${
            isFocused ? 'border-blue-500 ring-2 ring-blue-200' : ''
          }`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus={autoFocus}
          {...props}
        />
        
        {searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => {
              setSearchTerm('');
              onSearch('');
              inputRef.current?.focus();
            }}
          >
            <svg 
              className="w-4 h-4 text-gray-500 hover:text-gray-700"
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Search keyboard shortcut hint */}
      <div className="hidden md:block absolute right-3 top-2 text-xs text-gray-400">
        Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded">ESC</kbd> to clear
      </div>
    </div>
  );
};

export default React.memo(OptimizedSearchInput);