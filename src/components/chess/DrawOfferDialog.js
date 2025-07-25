import React, { useState, useEffect, useCallback } from 'react';
import { ChessApi } from '../../api/chess';

const DrawOfferDialog = ({ gameId, isVisible, onClose, onGameEnd }) => {
  const [drawOffers, setDrawOffers] = useState([]);
  const [isOffering, setIsOffering] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pending draw offers
  const fetchDrawOffers = useCallback(async () => {
    if (!gameId || !isVisible) return;
    
    try {
      const response = await ChessApi.getDrawOffers(gameId);
      if (response.success) {
        setDrawOffers(response.offers || []);
      } else {
        setError(response.message || 'Failed to fetch draw offers');
      }
    } catch (err) {
      // Only show error if it's not a 404 (endpoint doesn't exist yet)
      if (!err.message?.includes('404') && !err.message?.includes('not found')) {
        setError('Failed to fetch draw offers');
        console.error('Error fetching draw offers:', err);
      }
      // Reset offers array to empty for missing endpoints
      setDrawOffers([]);
    }
  }, [gameId, isVisible]);

  useEffect(() => {
    fetchDrawOffers();
    
    // Poll for updates every 5 seconds when dialog is visible
    let pollInterval;
    if (isVisible) {
      pollInterval = setInterval(fetchDrawOffers, 5000);
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [fetchDrawOffers, isVisible]);

  // Offer a draw
  const handleOfferDraw = async () => {
    setIsOffering(true);
    setError(null);
    
    try {
      const response = await ChessApi.offerDraw(gameId);
      if (response.success) {
        if (response.game_ended) {
          // Game ended in a draw
          onGameEnd && onGameEnd('1/2-1/2', 'mutual agreement');
          onClose();
        } else {
          // Draw offer sent
          await fetchDrawOffers();
        }
      } else {
        setError(response.message || 'Failed to offer draw');
      }
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Draw offers feature is not available yet. Please try again later.');
      } else {
        setError('Failed to offer draw');
        console.error('Error offering draw:', err);
      }
    } finally {
      setIsOffering(false);
    }
  };

  // Respond to a draw offer
  const handleRespondToDraw = async (response) => {
    setIsResponding(true);
    setError(null);
    
    try {
      const apiResponse = await ChessApi.respondToDraw(gameId, response);
      if (apiResponse.success) {
        if (apiResponse.game_ended) {
          // Game ended in a draw
          onGameEnd && onGameEnd('1/2-1/2', 'mutual agreement');
          onClose();
        } else {
          // Draw offer declined
          await fetchDrawOffers();
        }
      } else {
        setError(apiResponse.message || 'Failed to respond to draw offer');
      }
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setError('Draw offers feature is not available yet. Please try again later.');
      } else {
        setError('Failed to respond to draw offer');
        console.error('Error responding to draw:', err);
      }
    } finally {
      setIsResponding(false);
    }
  };

  if (!isVisible) return null;

  const pendingOffers = drawOffers.filter(offer => offer.can_respond);
  const myOffers = drawOffers.filter(offer => !offer.can_respond);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Draw Offers
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Pending draw offers from opponent */}
        {pendingOffers.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Draw Offers Received
            </h4>
            {pendingOffers.map((offer) => (
              <div key={offer.id} className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <strong>{offer.offerer_name}</strong> has offered a draw
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRespondToDraw('accept')}
                    disabled={isResponding}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResponding ? 'Accepting...' : 'Accept Draw'}
                  </button>
                  <button
                    onClick={() => handleRespondToDraw('decline')}
                    disabled={isResponding}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResponding ? 'Declining...' : 'Decline'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My pending draw offers */}
        {myOffers.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Your Draw Offers
            </h4>
            {myOffers.map((offer) => (
              <div key={offer.id} className="bg-blue-50 dark:bg-blue-900 rounded p-3 mb-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Draw offer sent to {offer.offerer_name}. Waiting for response...
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Offer draw button (only if no pending offers) */}
        {pendingOffers.length === 0 && myOffers.length === 0 && (
          <div className="mb-4">
            <button
              onClick={handleOfferDraw}
              disabled={isOffering}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isOffering ? 'Offering Draw...' : 'Offer Draw'}
            </button>
          </div>
        )}

        {/* Info message when no offers */}
        {pendingOffers.length === 0 && myOffers.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            No pending draw offers. You can offer a draw to your opponent.
          </p>
        )}
      </div>
    </div>
  );
};

export default DrawOfferDialog;
