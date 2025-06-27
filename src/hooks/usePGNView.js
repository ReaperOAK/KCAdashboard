import { useEffect, useRef } from 'react';
import PGNApiService from '../utils/pgnApi';

/**
 * Custom hook to record PGN views for analytics
 * @param {number} gameId - The PGN game ID
 * @param {Object} options - Options for view recording
 * @param {boolean} options.enabled - Whether to record views (default: true)
 * @param {number} options.delay - Delay before recording view in ms (default: 2000)
 * @returns {Object} View recording state and functions
 */
const usePGNView = (gameId, options = {}) => {
  const { enabled = true, delay = 2000 } = options;
  const recordedRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Reset recorded state when gameId changes
    recordedRef.current = false;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only record if enabled and gameId is valid
    if (!enabled || !gameId || typeof gameId !== 'number') {
      return;
    }

    // Record view after delay to ensure user actually views the game
    timeoutRef.current = setTimeout(async () => {
      if (!recordedRef.current) {
        try {
          await PGNApiService.recordView(gameId);
          recordedRef.current = true;
          console.log(`View recorded for PGN ${gameId}`);
        } catch (error) {
          console.warn(`Failed to record view for PGN ${gameId}:`, error);
        }
      }
    }, delay);

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [gameId, enabled, delay]);

  // Manual record function for immediate recording
  const recordView = async () => {
    if (!gameId || recordedRef.current) return false;
    
    try {
      await PGNApiService.recordView(gameId);
      recordedRef.current = true;
      return true;
    } catch (error) {
      console.warn(`Failed to record view for PGN ${gameId}:`, error);
      return false;
    }
  };

  return {
    isRecorded: recordedRef.current,
    recordView
  };
};

export default usePGNView;
