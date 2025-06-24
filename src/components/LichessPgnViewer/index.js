import React, { useEffect, useRef, useState } from 'react';

// Import the package exactly as shown in the documentation
import LichessPgnViewerLib from 'lichess-pgn-viewer';
// Removing CSS import to test if it's causing SVG issues
// import './lichess-pgn-viewer.css';
import PgnFallback from './fallback';

// Enhanced global error handler for SVG and DOM issues
const setupGlobalErrorHandler = () => {
  const originalError = window.onerror;
  const originalUnhandledRejection = window.onunhandledrejection;
  
  // Handle window errors
  window.onerror = function(message, source, lineno, colno, error) {
    if (typeof message === 'string' && 
        (message.includes('attribute d: Expected arc flag') || 
         message.includes('SVG') || 
         message.includes('<path>') ||
         message.includes('Invalid value for') ||
         message.includes('arc flag'))) {
      console.warn('SVG/DOM error caught and suppressed:', message);
      return true; // Prevent default error handling
    }
    if (originalError) {
      return originalError.apply(this, arguments);
    }
    return false;
  };
  
  // Handle unhandled promise rejections
  window.onunhandledrejection = function(event) {
    if (event.reason && typeof event.reason === 'string' &&
        (event.reason.includes('SVG') || 
         event.reason.includes('arc flag') ||
         event.reason.includes('<path>'))) {
      console.warn('SVG promise rejection caught and suppressed:', event.reason);
      event.preventDefault();
      return;
    }
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(this, event);
    }
  };
  
  // Override console.error temporarily to catch SVG errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('attribute d: Expected arc flag') ||
        message.includes('SVG') ||
        message.includes('<path>') ||
        message.includes('Invalid value for')) {
      console.warn('Console SVG error suppressed:', message);
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  return () => {
    window.onerror = originalError;
    window.onunhandledrejection = originalUnhandledRejection;
    console.error = originalConsoleError;
  };
};

/**
 * React component that wraps the Lichess PGN Viewer library
 */
const LichessPgnViewer = ({ pgn, options = {}, containerClassName = "" }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [error, setError] = useState(null);
  const cleanupErrorHandlerRef = useRef(null);

  // Setup global error handler on mount
  useEffect(() => {
    cleanupErrorHandlerRef.current = setupGlobalErrorHandler();
    
    return () => {
      if (cleanupErrorHandlerRef.current) {
        cleanupErrorHandlerRef.current();
      }
    };
  }, []);

  // Improved function to handle resize and adjust the board
  const handleResize = () => {
    if (!containerRef.current || !viewerRef.current) return;

    try {
      // Get the board container element
      const lpvElement = containerRef.current.querySelector('.lpv');
      if (lpvElement) {
        // Force layout recalculation by accessing offsetHeight
        // This helps ensure elements are properly sized before redraw
        // eslint-disable-next-line no-unused-expressions
        lpvElement.offsetHeight;
        
        // Ensure proper layout adjustment
        const boardElement = lpvElement.querySelector('.lpv__board');
        const cgWrap = boardElement?.querySelector('.cg-wrap');
        
        if (boardElement && cgWrap) {
          // For mobile devices, make sure we're not causing scroll issues
          if (window.innerWidth < 768) {
            // Adjust container heights if needed
            const containerHeight = containerRef.current.offsetHeight;
            const windowHeight = window.innerHeight;
            
            if (containerHeight > windowHeight * 0.8) {
              // Limit container height on small devices to avoid overflow
              containerRef.current.style.maxHeight = `${windowHeight * 0.8}px`;
            }
          }
          
          // Let the layout adjust naturally
          setTimeout(() => {
            // Redraw with proper dimensions
            if (viewerRef.current && typeof viewerRef.current.redraw === 'function') {
              viewerRef.current.redraw();
            }
          }, 50);
        }
      }
    } catch (e) {
      console.error('Error adjusting board size:', e);
    }
  };

  // Effect for cleaning up on unmount
  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
        viewerRef.current.destroy();
      }
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, []);  useEffect(() => {
    if (!pgn || !containerRef.current) return;

    // Store container reference to avoid cleanup issues
    const currentContainer = containerRef.current;
      // Enhanced error handling for SVG path errors
    const originalConsoleError = console.error;
    const originalCreateElementNS = document.createElementNS;
    
    // More comprehensive SVG path fixing function
    const fixSVGPath = (pathData) => {
      if (typeof pathData !== 'string') return pathData;
      
      // Fix the specific malformed arc flags in the error
      let fixed = pathData
        // Fix "a1 0 01" to "a1 0 0 1" (space between arc flags)
        .replace(/a1\s+0\s+01/g, 'a1 0 0 1')
        // Fix "a1 0 10" to "a1 0 1 0" 
        .replace(/a1\s+0\s+10/g, 'a1 0 1 0')
        // Fix "a1 1 01" to "a1 1 0 1"
        .replace(/a1\s+1\s+01/g, 'a1 1 0 1')
        // Fix "a1 1 10" to "a1 1 1 0"
        .replace(/a1\s+1\s+10/g, 'a1 1 1 0')
        // More general fix for any "a<num> <num> <two_digits>" pattern
        .replace(/a(\d+)\s+(\d+)\s+(\d)(\d)/g, 'a$1 $2 $3 $4')
        // Ensure proper spacing around arc commands
        .replace(/a(\d)/g, ' a$1')
        .replace(/\s+/g, ' ')
        .trim();
      
      return fixed;
    };
    
    // Intercept SVG element creation to prevent problematic paths
    document.createElementNS = function(namespaceURI, qualifiedName) {
      const element = originalCreateElementNS.call(this, namespaceURI, qualifiedName);
      
      if (namespaceURI === 'http://www.w3.org/2000/svg' && qualifiedName === 'path') {
        const originalSetAttribute = element.setAttribute;
        
        // Override setAttribute for path elements to validate 'd' attribute
        element.setAttribute = function(name, value) {
          if (name === 'd') {
            const fixedValue = fixSVGPath(value);
            console.log('SVG path intercepted and fixed:', { original: value, fixed: fixedValue });
            return originalSetAttribute.call(this, name, fixedValue);
          }
          return originalSetAttribute.call(this, name, value);
        };
        
        // Also override the 'd' property setter
        const originalDescriptor = Object.getOwnPropertyDescriptor(SVGPathElement.prototype, 'd') || 
                                 Object.getOwnPropertyDescriptor(Element.prototype, 'd');
        
        if (originalDescriptor && originalDescriptor.set) {
          Object.defineProperty(element, 'd', {
            get: originalDescriptor.get,
            set: function(value) {
              const fixedValue = fixSVGPath(value);
              return originalDescriptor.set.call(this, fixedValue);
            }
          });
        }
      }
      
      return element;
    };
    
    const tempErrorHandler = (...args) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('attribute d: Expected arc flag') || 
          errorMessage.includes('SVG') || 
          errorMessage.includes('<path>')) {
        console.warn('SVG path error caught and handled:', errorMessage);
        return; // Don't log SVG errors to console
      }
      originalConsoleError.apply(console, args);
    };
    
    console.error = tempErrorHandler;
    
    try {
      // Clean up previous instance if it exists
      if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
        viewerRef.current.destroy();
      }
      currentContainer.innerHTML = '';
      
      // Clean up any existing observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      // Wait for next frame to ensure container has dimensions
      requestAnimationFrame(() => {
        try {          // Initialize with ultra-minimal options to avoid all SVG issues
          viewerRef.current = LichessPgnViewerLib(currentContainer, {
            pgn: pgn,
            showPlayers: false, // Disable players to avoid any SVG icons
            showClocks: false, // Disable clocks
            showMoves: 'right',
            scrollToMove: false, // Disable scrolling animations
            keyboardToMove: false, // Disable keyboard navigation
            orientation: undefined,
            initialPly: 0,
            classes: 'kca-themed-viewer kca-no-svg',
            chessground: {
              animation: { duration: 0 }, // Disable all animations
              highlight: { lastMove: false, check: false }, // Disable highlighting
              movable: { free: false },
              responsive: false, // Disable responsive features
              drawable: { enabled: false }, // Disable all drawing
              coordinates: false // Disable coordinate labels
            },
            drawArrows: false,
            viewOnly: true,
            resizable: false, // Complete disable resizing
            menu: false, // Disable entire menu system
            ...options
          });
          
          // Add mutation observer to fix any SVG paths that get created later
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Check if it's an SVG path or contains SVG paths
                  const paths = node.tagName === 'path' ? [node] : 
                              node.querySelectorAll ? node.querySelectorAll('path') : [];
                  
                  paths.forEach((pathElement) => {
                    const d = pathElement.getAttribute('d');
                    if (d) {
                      const fixedD = fixSVGPath(d);
                      if (fixedD !== d) {
                        console.log('Fixing SVG path via mutation observer:', { original: d, fixed: fixedD });
                        pathElement.setAttribute('d', fixedD);
                      }
                    }
                  });
                }
              });
            });
          });
          
          // Start observing after a delay to catch any delayed SVG creation
          setTimeout(() => {
            observer.observe(currentContainer, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['d']
            });
          }, 100);
          
          // Create new ResizeObserver with ref but with less aggressive monitoring
          resizeObserverRef.current = new ResizeObserver(() => {
            // Use a longer delay to prevent rapid SVG redraws
            setTimeout(() => {
              try {
                handleResize();
              } catch (e) {
                // Silently handle resize errors
                console.warn('Resize error handled:', e.message);
              }
            }, 150);
          });
          
          // Only observe the main container, not internal elements
          resizeObserverRef.current.observe(currentContainer);
          
          window.addEventListener('resize', handleResize);
          
          // Initial adjustment after a longer delay
          setTimeout(() => {
            try {
              handleResize();
            } catch (e) {
              console.warn('Initial resize error handled:', e.message);
            }
          }, 500);
          
          // Restore console.error and createElementNS after initialization
          setTimeout(() => {
            console.error = originalConsoleError;
            document.createElementNS = originalCreateElementNS;
          }, 2000);
          
        } catch (innerError) {
          console.error = originalConsoleError;
          document.createElementNS = originalCreateElementNS;
          console.error('Error in PGN viewer initialization:', innerError);
          setError('Failed to initialize PGN viewer');
        }
      });
      
      setError(null);
    } catch (error) {
      console.error = originalConsoleError;
      document.createElementNS = originalCreateElementNS;
      console.error('Error initializing Lichess PGN Viewer:', error);
      setError(error.message || "Failed to initialize PGN viewer");
    }
  }, [pgn, options]);

  // If there's an error, show the fallback component
  if (error) {
    return <PgnFallback pgn={pgn} title="PGN Analysis (Fallback View)" />;
  }

  return (
    <div className={`lichess-pgn-viewer-wrapper w-full h-full ${containerClassName}`} 
         style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          position: 'relative',
          flex: '1 1 auto',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' // Prevent scrolling issues
        }}
      ></div>
      
      {!pgn && (
        <div className="p-4 text-gray-500 text-center">
          No PGN content available to display.
        </div>
      )}
    </div>
  );
};

export default LichessPgnViewer;
