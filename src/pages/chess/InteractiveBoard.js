import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import ChessBoard from '../../components/chess/ChessBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
// import MoveHistory from '../../components/chess/MoveHistory';
// import PGNViewer from '../../components/chess/PGNViewer';
import ApiService from '../../utils/api';

const InteractiveBoard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState('start');
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [orientation, setOrientation] = useState('white');
  const [lastMoveAt, setLastMoveAt] = useState(null);
  // Simul/active games state
  const [activeGames, setActiveGames] = useState([]);

  // PGN is tracked in the backend, no need to keep in state here

  // Fetch active games for switcher (simul support)
  useEffect(() => {
    ApiService.getChessGames('active').then(res => {
      if (res.success && Array.isArray(res.games)) {
        // Try to get user ID from localStorage (if stored as 'user' object)
        let userId = null;
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userId = userObj.id || userObj.user_id || userObj._id;
          }
        } catch {}

        // Fallback: try to infer from first game if not found
        if (!userId && res.games.length > 0) {
          // If you are always white or black in all games, this will not work for all users
          // but it's a fallback for single-user dev
          userId = res.games[0].white_player?.id;
        }

        // Attach opponent name and your color to each game
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

  // Simple function to poll for game updates and handle game over
  const pollGameUpdates = useCallback(async () => {
    if (!id) return;
    try {
      const response = await ApiService.getGameDetails(id);
      if (response.success && response.game) {
        // If game is no longer active, redirect both players
        if (response.game.status && response.game.status !== 'active') {
          // Optionally, show a message before redirecting
          alert('Game over: ' + (response.game.reason || response.game.status) + '\nYou will be redirected to the game lobby.');
          navigate('/chess/play');
          setError('redirected-to-lobby');
          return;
        }
        // Only update if the position has changed
        if (response.game.position !== position) {
          console.log("Game updated with opponent's move:", {
            newPosition: response.game.position,
            lastMoveAt: response.game.lastMove
          });
          setGameData(response.game);
          setPosition(response.game.position);
          setLastMoveAt(response.game.lastMove);
        }
      }
    } catch (err) {
      console.error("Error polling for game updates:", err);
    }
  }, [id, position, navigate]);


  // Helper to fetch PGN (for download button)
  const [pgn, setPgn] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  // Fetch move history, PGN, and FEN history from backend
  const fetchMoveHistory = useCallback(async (gameId) => {
    if (!gameId) return;
    try {
      const res = await ApiService.getMoveHistory(gameId);
      if (res && res.success) {
        setPgn(res.pgn || '');
        setMoveHistory(res.moves || []);
        setFenHistory(res.fen_history || []);
        setCurrentMoveIndex((res.moves && res.moves.length > 0) ? res.moves.length - 1 : -1);
      }
    } catch (err) {
      console.error('Failed to fetch move history:', err);
    }
  }, []);

  // Load game data and move history when ID is provided
  useEffect(() => {
    let pollInterval = null;
    if (id) {
      // Initial game load
      const loadGame = async () => {
        try {
          setLoading(true);
          const response = await ApiService.getGameDetails(id);
          if (response.success && response.game) {
            setGameData(response.game);
            setPosition(response.game.position || 'start');
            setLastMoveAt(response.game.lastMove);
            if (response.game.yourColor === 'black') {
              setOrientation('black');
            }
            // Fetch move history/PGN/FEN
            fetchMoveHistory(id);
          } else {
            setError('Failed to load game data');
          }
        } catch (err) {
          console.error('Error loading game:', err);
          setError('Failed to load game. Please refresh the page.');
        } finally {
          setLoading(false);
        }
      };
      loadGame();
      // Set up polling for opponent's moves every 2 seconds
      pollInterval = setInterval(() => {
        pollGameUpdates();
        fetchMoveHistory(id);
      }, 2000);
    }
    // Clean up interval on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [id, pollGameUpdates, fetchMoveHistory]);
  
  // Check if a challenge has been accepted (only run when not viewing a game)
  useEffect(() => {
    let checkChallengeInterval = null;
    
    if (!id) {
      const checkForAcceptedChallenges = async () => {
        try {
          const response = await ApiService.getChallenges();
          
          if (response.success && response.challenges) {
            // Find an accepted challenge with a game ID
            const acceptedChallenge = response.challenges.find(
              c => c.direction === 'outgoing' && c.gameId && c.status === 'accepted'
            );
            
            if (acceptedChallenge) {
              // Navigate to the game
              navigate(`/chess/game/${acceptedChallenge.gameId}`);
            }
          }
        } catch (err) {
          console.error("Error checking challenges:", err);
        }
      };
      
      // Check immediately and then every 3 seconds
      checkForAcceptedChallenges();
      checkChallengeInterval = setInterval(checkForAcceptedChallenges, 3000);
    }
    
    return () => {
      if (checkChallengeInterval) {
        clearInterval(checkChallengeInterval);
      }
    };
  }, [id, navigate]);
  
  // Handle move submission
  const handleMove = async (move, fen) => {
    if (!id) {
      setPosition(fen);
      return;
    }
    try {
      setPosition(fen);
      setGameData(prev => ({ ...prev, yourTurn: false }));
      await ApiService.makeGameMove(id, move, fen);
      // Fetch move history after move
      fetchMoveHistory(id);
    } catch (error) {
      console.error('Failed to submit move:', error);
      const response = await ApiService.getGameDetails(id);
      if (response.success && response.game) {
        setGameData(response.game);
        setPosition(response.game.position);
      }
    }
  };
  
  // Handle move selection from MoveHistory (jump to move)
  const handleGoToMove = (moveIndex) => {
    if (!fenHistory || fenHistory.length === 0) return;
    // fenHistory[0] is the initial position, so moveIndex+1
    const fen = fenHistory[moveIndex + 1] || fenHistory[fenHistory.length - 1];
    setCurrentMoveIndex(moveIndex);
    setPosition(fen);
  };

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

  if (error === 'redirected-to-lobby') {
    return null;
  }
  if (loading) {
    return <div className="flex justify-center items-center min-h-96 text-purple-700 font-bold text-lg">Loading chess board...</div>;
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="text-red-600 font-bold text-center">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-700 text-white border-none rounded cursor-pointer hover:bg-purple-800 transition-colors"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 pb-10">
      <h1 className="text-3xl font-bold text-purple-900 mb-5">{id ? 'Game Board' : 'Analysis Board'}</h1>
      <ChessNavigation />

      {/* Simul/Active Games Switcher */}
      {activeGames.length > 1 && id && (
        <div className="mb-6 flex items-center gap-2">
          <span className="font-semibold">Switch Game:</span>
          <select
            value={id}
            onChange={e => navigate(`/chess/game/${e.target.value}`)}
            className="border rounded px-2 py-1"
          >
            {activeGames.map(game => (
              <option key={game.id} value={game.id}>
                vs {game.opponent?.name || 'Unknown'} ({game.yourColor})
                {game.status === 'active' ? '' : ' (ended)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* PGN Download Button */}
      {id && pgn && (
        <div className="mb-4 flex justify-end">
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-semibold"
            onClick={() => {
              const blob = new Blob([pgn], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `game-${id}.pgn`;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            }}
          >
            Download PGN
          </button>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <ChessBoard 
          position={position}
          orientation={orientation}
          allowMoves={id ? (gameData && gameData.yourTurn && gameData.status === 'active') : true}
          showHistory={true}
          showAnalysis={!id}
          onMove={handleMove}
          playMode={id ? 'vs-human' : 'analysis'}
          width={600}
          gameId={id}
          backendMoveHistory={moveHistory}
          fenHistory={fenHistory}
          currentMoveIndex={currentMoveIndex}
          goToMove={handleGoToMove}
        />
      </div>
      {gameData && (
        <div className="bg-white rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-purple-700 mb-4">Game Information</h2>
          {gameData.status === 'abandoned' && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4">
              <div className="text-orange-800 font-semibold">Game Expired</div>
              <div className="text-orange-700 text-sm">
                This game was automatically expired due to inactivity. 
                {gameData.reason === 'inactivity timeout' && ' No moves were made for an extended period.'}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <p><strong className="text-gray-700">Opponent:</strong> <span className="text-gray-900">{gameData.opponent && gameData.opponent.name}</span></p>
            <p><strong className="text-gray-700">Your Color:</strong> <span className="text-gray-900 capitalize">{gameData.yourColor}</span></p>
            <p><strong className="text-gray-700">Time Control:</strong> <span className="text-gray-900">{gameData.timeControl || 'Standard'}</span></p>
            <p><strong className="text-gray-700">Turn:</strong> <span className={`font-semibold ${gameData.yourTurn ? "text-green-600" : "text-blue-600"}`}>
              {gameData.yourTurn ? 'Your move' : "Opponent's move"}
            </span></p>
            {lastMoveAt && (
              <p>
                <strong className="text-gray-700">Last Move:</strong> 
                <span className="text-gray-900">{formatIST(lastMoveAt)}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InteractiveBoard;
