import { useState, useEffect, useCallback, useRef } from 'react';
import { ChessApi } from '../api/chess';
import { useNavigate } from 'react-router-dom';

export function useChessGame(id) {
  const navigate = useNavigate();
  const [position, setPosition] = useState('start');
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [orientation, setOrientation] = useState('white');
  const [lastMoveAt, setLastMoveAt] = useState(null);
  const [activeGames, setActiveGames] = useState([]);
  const [pgn, setPgn] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [timeLeft, setTimeLeft] = useState(600);
  const timerRef = useRef();

  // Set initial timeLeft when your turn or lastMoveAt changes
  useEffect(() => {
    const isActive = gameData && gameData.status === 'active';
    const isYourTurn = gameData && gameData.yourTurn;
    if (isActive && isYourTurn && lastMoveAt) {
      const lastMoveTime = new Date(lastMoveAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - lastMoveTime) / 1000);
      setTimeLeft(Math.max(600 - elapsed, 0));
    } else {
      setTimeLeft(600);
    }
  }, [gameData, lastMoveAt]);

  // Countdown interval: only set up when your turn starts, not on every tick
  const isActive = gameData && gameData.status === 'active';
  const isYourTurn = gameData && gameData.yourTurn;
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isActive && isYourTurn && lastMoveAt) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lastMoveAt, isActive, isYourTurn]);

  // Fetch active games for switcher (simul support)
  useEffect(() => {
    ChessApi.getChessGames('active').then(res => {
      if (res.success && Array.isArray(res.games)) {
        let userId = null;
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userId = userObj.id || userObj.user_id || userObj._id;
          }
        } catch {}
        if (!userId && res.games.length > 0) {
          userId = res.games[0].white_player?.id;
        }
        const gamesWithOpponent = res.games.map(game => {
          let yourColor = '';
          let opponent = { name: 'Unknown' };
          if (userId) {
            if (game.white_player && String(game.white_player.id) === String(userId)) {
              yourColor = 'white';
              opponent = game.black_player || { name: 'Unknown' };
            } else if (game.black_player && String(game.black_player.id) === String(userId)) {
              yourColor = 'black';
              opponent = game.white_player || { name: 'Unknown' };
            }
          }
          return { ...game, yourColor, opponent };
        });
        setActiveGames(gamesWithOpponent);
      }
    });
  }, []);

  // Poll for game updates and handle game over
  const pollGameUpdates = useCallback(async () => {
    if (!id) return;
    try {
      const response = await ChessApi.getGameDetails(id);
      if (response.success && response.game) {
        if (response.game.status && response.game.status !== 'active') {
          alert('Game over: ' + (response.game.reason || response.game.status) + '\nYou will be redirected to the game lobby.');
          navigate('/chess/play');
          setError('redirected-to-lobby');
          return;
        }
        if (response.game.position !== position) {
          setGameData(response.game);
          setPosition(response.game.position);
          setLastMoveAt(response.game.lastMove);
        }
      }
    } catch (err) {
      // Log error, but don't break polling
    }
  }, [id, position, navigate]);

  // Fetch move history, PGN, and FEN history from backend
  const fetchMoveHistory = useCallback(async (gameId) => {
    if (!gameId) return;
    try {
      const res = await ChessApi.getMoveHistory(gameId);
      if (res && res.success) {
        setPgn(res.pgn || '');
        setMoveHistory(res.moves || []);
        setFenHistory(res.fen_history || []);
        setCurrentMoveIndex((res.moves && res.moves.length > 0) ? res.moves.length - 1 : -1);
      }
    } catch {}
  }, []);

  // Load game data and move history when ID is provided
  useEffect(() => {
    let pollInterval = null;
    if (id) {
      const loadGame = async () => {
        try {
          setLoading(true);
          const response = await ChessApi.getGameDetails(id);
          if (response.success && response.game) {
            setGameData(response.game);
            setPosition(response.game.position || 'start');
            setLastMoveAt(response.game.lastMove);
            if (response.game.yourColor === 'black') {
              setOrientation('black');
            }
            fetchMoveHistory(id);
          } else {
            setError('Failed to load game data');
          }
        } catch {
          setError('Failed to load game. Please refresh the page.');
        } finally {
          setLoading(false);
        }
      };
      loadGame();
      pollInterval = setInterval(() => {
        pollGameUpdates();
        fetchMoveHistory(id);
      }, 2000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [id, pollGameUpdates, fetchMoveHistory]);

  // Check if a challenge has been accepted (only run when not viewing a game)
  useEffect(() => {
    let checkChallengeInterval = null;
    if (!id) {
      const checkForAcceptedChallenges = async () => {
        try {
          const response = await ChessApi.getChallenges();
          if (response.success && response.challenges) {
            const acceptedChallenge = response.challenges.find(
              c => c.direction === 'outgoing' && c.gameId && c.status === 'accepted'
            );
            if (acceptedChallenge) {
              navigate(`/chess/game/${acceptedChallenge.gameId}`);
            }
          }
        } catch {}
      };
      checkForAcceptedChallenges();
      checkChallengeInterval = setInterval(checkForAcceptedChallenges, 3000);
    }
    return () => {
      if (checkChallengeInterval) clearInterval(checkChallengeInterval);
    };
  }, [id, navigate]);

  // Handle move submission
  const handleMove = useCallback(async (move, fen) => {
    if (!id) {
      setPosition(fen);
      return;
    }
    try {
      setPosition(fen);
      setGameData(prev => ({ ...prev, yourTurn: false }));
      const moveResponse = await ChessApi.makeGameMove(id, move, fen);
      // Immediately update lastMoveAt from backend response for timer sync
      if (moveResponse && moveResponse.lastMoveAt) {
        setLastMoveAt(moveResponse.lastMoveAt);
      }
      fetchMoveHistory(id);
    } catch {
      const response = await ChessApi.getGameDetails(id);
      if (response.success && response.game) {
        setGameData(response.game);
        setPosition(response.game.position);
        if (response.game.lastMove) {
          setLastMoveAt(response.game.lastMove);
        }
      }
    }
  }, [id, fetchMoveHistory]);

  // Handle move selection from MoveHistory (jump to move)
  const handleGoToMove = useCallback((moveIndex) => {
    if (!fenHistory || fenHistory.length === 0) return;
    const fen = fenHistory[moveIndex + 1] || fenHistory[fenHistory.length - 1];
    setCurrentMoveIndex(moveIndex);
    setPosition(fen);
  }, [fenHistory]);

  // Helper to format date/time in IST
  const formatIST = (dateString) => {
    try {
      let s = dateString;
      if (s && !s.includes('T')) s = s.replace(' ', 'T');
      if (s && !s.endsWith('Z')) s += 'Z';
      const d = new Date(s);
      return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    } catch {
      return dateString;
    }
  };

  return {
    position,
    setPosition,
    loading,
    error,
    gameData,
    orientation,
    lastMoveAt,
    activeGames,
    pgn,
    moveHistory,
    fenHistory,
    currentMoveIndex,
    setCurrentMoveIndex,
    timeLeft,
    handleMove,
    handleGoToMove,
    formatIST,
  };
}
