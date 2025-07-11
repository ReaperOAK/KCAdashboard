import { useState, useEffect } from 'react';
import { ChessApi } from '../api/chess';

export function useChessData(activeTab, gameStatus) {
  const [games, setGames] = useState([]);
  const [practicePositions, setPracticePositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'games') {
          const gamesResponse = await ChessApi.getChessGames(gameStatus);
          if (isMounted && gamesResponse.success) setGames(gamesResponse.games || []);
        }
        if (activeTab === 'practice') {
          const practiceResponse = await ChessApi.getPracticePositions();
          if (isMounted && practiceResponse.success) setPracticePositions(practiceResponse.positions || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load chess data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [activeTab, gameStatus]);

  return { games, practicePositions, loading, error };
}
