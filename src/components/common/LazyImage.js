import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage component for optimized image loading
 * - Only loads images when they're about to enter the viewport
 * - Shows a lightweight placeholder until the image is loaded
 * - Supports webp format with fallback
 * - Provides responsive sizing based on viewport
 * 
 * @param {Object} props Component props
 * @param {string} props.src Image source URL
 * @param {string} props.alt Alt text for the image
 * @param {string} props.webpSrc WebP version of the image (optional)
 * @param {string} props.placeholderColor Background color for placeholder
 * @param {string} props.className CSS classes to apply
 * @param {number} props.width Desired width of the image
 * @param {number} props.height Desired height of the image
 */
const LazyImage = ({
  src,
  alt,
  webpSrc,
  placeholderColor = '#f3f4f6',
  className = '',
  width,
  height,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef(null);

  // Set up intersection observer to detect when image enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before the image enters viewport
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle image load completion
  const handleImageLoaded = () => {
    setIsLoaded(true);
  };

  // Calculate aspect ratio for placeholder
  const aspectRatio = height && width ? (height / width) * 100 : 56.25; // Default to 16:9 if not specified

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: placeholderColor,
        paddingBottom: `${aspectRatio}%`,
        width: '100%',
      }}
      {...rest}
    >
      {isIntersecting && (
        <>
          {webpSrc ? (
            <picture>
              <source type="image/webp" srcSet={webpSrc} />
              <source type="image/jpeg" srcSet={src} />
              <img
                onLoad={handleImageLoaded}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                src={src}
                alt={alt}
                loading="lazy"
                width={width}
                height={height}
              />
            </picture>
          ) : (
            <img
              onLoad={handleImageLoaded}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              src={src}
              alt={alt}
              loading="lazy"
              width={width}
              height={height}
            />
          )}
        </>
      )}
      
      {/* Animated loading placeholder */}
      {(!isIntersecting || !isLoaded) && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          style={{
            backgroundImage: 'linear-gradient(90deg, #f3f4f6 0px, #e5e7eb 40%, #f3f4f6 80%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        >
          <style jsx>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default LazyImage;