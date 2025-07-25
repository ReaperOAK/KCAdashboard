import React, { useState, useEffect } from 'react';

const DrawOfferToast = ({ offer, onAccept, onDecline, onView, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to respond quickly

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsVisible(false);
          onClose && onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  if (!isVisible || !offer) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              Draw Offer Received
            </h4>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onClose && onClose();
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          <strong>{offer.offerer_name}</strong> has offered a draw
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                onAccept && onAccept();
                setIsVisible(false);
              }}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => {
                onDecline && onDecline();
                setIsVisible(false);
              }}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Decline
            </button>
          </div>
          
          <button
            onClick={() => {
              onView && onView();
              setIsVisible(false);
            }}
            className="w-full px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            View Details
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Auto-hide in {timeLeft}s
        </div>
      </div>
    </div>
  );
};

export default DrawOfferToast;
