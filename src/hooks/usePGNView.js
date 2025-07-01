
import { useEffect, useRef, useCallback } from 'react';
import { PGNApiService } from '../utils/pgnApi';

/**
 * Custom hook to record PGN views for analytics (stateless, composable)
 * @param {number} gameId - The PGN game ID
 * @param {Object} options - Options for view recording
 * @param {boolean} options.enabled - Whether to record views (default: true)
 * @param {number} options.delay - Delay before recording view in ms (default: 2000)
 * @returns {Object} View recording state and functions
 */
export const usePGNView = (gameId, options = {}) => {
  const { enabled = true, delay = 2000 } = options;
  const recordedRef = useRef(false);
  const timeoutRef = useRef(null);

  // Named handler for recording view (for both auto and manual)
  const handleRecordView = useCallback(async () => {
    if (!gameId || recordedRef.current) return false;
    try {
      await PGNApiService.recordView(gameId);
      recordedRef.current = true;
      return true;
    } catch (error) {
      // Non-blocking: log but don't throw
      // eslint-disable-next-line no-console
      console.warn(`Failed to record view for PGN ${gameId}:`, error);
      return false;
    }
  }, [gameId]);

  useEffect(() => {
    recordedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!enabled || !gameId || typeof gameId !== 'number') return;
    timeoutRef.current = setTimeout(() => {
      handleRecordView();
    }, delay);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [gameId, enabled, delay, handleRecordView]);

  return {
    isRecorded: recordedRef.current,
    recordView: handleRecordView,
  };
};

// Default export for backward compatibility
export default usePGNView;
